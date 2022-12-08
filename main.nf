#!/usr/bin/env nextflow

if (params.help) {
	    log.info"""
	    ==============================================
	    LRGASP CHALLENAGE 3 BENCHMARKING PIPELINE
	    Author(s): Tianyuan Liu
        Genomics of Gene Expression Lab
	    ==============================================
	    Usage:
	    Run the pipeline with default parameters:
	    nextflow run main.nf -profile docker
	    Run with user parameters:
 	    nextflow run main.nf -profile docker --input {FASTA.file} --public_ref_dir {validation.reference.file} --participant_id {species.name} --assess_dir {benchmark.data.dir}  --results_dir {output.dir}
	    Mandatory arguments:
                --input                 FASTA file submitted by the participants
                --community_id          Name or OEB permanent ID for the benchmarking community
                --public_ref_dir        Directory with public reference genome and annotation files
                --participant_id        Name of the pipeline used for benchmarking
                --challenges_ids        list of challenges (performance evaluation methods) which are performed in the benchmark (Num. Isoforms detected/% Mapping to genome/% Multi-exonic isoforms/% Full Illumin support/SIRVs/)
                --assess_dir            directory where the performance metrics for other participants to be compared with the submitted one are found
	    Other options:
                --validation_results    The output directory where the results from validation step will be saved
                --assessment_results    The output directory where the results from the computed metrics step will be saved
                --outdir                The output directory where the consolidation of the benchmark will be saved
                --statsdir              The output directory with nextflow statistics
                --data_model_export_dir The output dir where json file with benchmarking data model contents will be saved
                --otherdir              The output directory where custom results will be saved (no directory inside)
	    Flags:
                --help                  Display this message
	    """

	exit 1
} else {

	log.info """\
         =========================================
         LRGASP CHALLENAGE 3 BENCHMARKING PIPELINE
         =========================================
         input file: ${params.input}
         community id: ${params.community_id}
         gold standard: ${params.public_ref_dir}
         public reference directory: ${params.goldstandard_dir}
         participant id: ${params.participant_id}
         challenges ids: ${params.challenges_ids}
         assess directory: ${params.assess_dir}
         consolidated benchmark results directory: ${params.outdir}
         validation result: ${params.validation_result}
         assessment results: ${params.assessment_results}
         data model export directory: ${params.data_model_export_dir}
         """
}

participant_id = params.participant_id
community_id = params.community_id
challenges_ids = params.challenges_ids

input = file(params.input)

goldstandard_dir = file(params.goldstandard_dir)

data_model_export_dir = file(params.data_model_export_dir)
validation_result = file(params.validation_result)

public_ref_dir = file(params.public_ref_dir, type: 'dir' )
assessment_results = file(params.assessment_results, type: 'dir' )
metrics_data = file(params.otherdir, type: 'dir' )

assess_dir = Channel.fromPath(params.assess_dir, type: 'dir' )
aggregation_dir = Channel.fromPath(params.outdir, type: 'dir')


process validation {
    input:
    file input
    file validation_result

    val community_id
    val challenges_ids
    val participant_id

    path public_ref_dir
    path goldstandard_dir

    output:
    val task.exitStatus into EXIT_STAT_VAL
    file validation_result into validation_out

    script:
    """
    python /app/validation.py -i $input  -com $community_id -c $challenges_ids -p $participant_id -r $public_ref_dir -o $validation_result --coverage $goldstandard_dir
    """
}

process compute_metrics {

    publishDir "${assessment_results.parent}", saveAs: { filename -> assessment_results.name }, mode: 'copy'

    input:
    val file_validated from EXIT_STAT_VAL
    val challenges_ids

    file input

    path public_ref_dir
    path goldstandard_dir

    output:
    val task.exitStatus into EXIT_STAT_COMP

    //output:
    //file 'metrics.json' into metrics_out

    when:
    file_validated == 0

	"""
	source activate sqanti_env
	python /app/sqanti3_lrgasp.challenge3.py $input $public_ref_dir $challenges_ids -c $goldstandard_dir
	"""
}


process consolidation {
    input:
    val file_computed from EXIT_STAT_COMP
    path metrics_data
    path assess_dir
    path aggregation_dir
    file data_model_export_dir

    when:
    file_computed == 0

    """
	python /app/manage_assessment_data.py --metrics_data $metrics_data --benchmark_data $assess_dir -o $aggregation_dir
	python /app/merge_data_model_files.py --participant_data $aggregation_dir --metrics_data $metrics_data --output $data_model_export_dir
    """
}

workflow.onComplete { 
	println ( workflow.success ? "LRGASP challenge 3 benchmarking finished!!!" : "Oops .. something went wrong" )
}

