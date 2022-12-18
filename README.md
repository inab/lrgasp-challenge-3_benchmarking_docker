# Long-read RGASP (LRGASP) challenge 3 benchmarking with OpenEBench
[LRGASP](https://www.gencodegenes.org/pages/LRGASP/) consortium is organizing a systematic evaluation of different transcript computational identification and quantification methods using long-read sequencing technologies such as [PacBio](https://www.pacb.com/) and [Oxford Nanopore](https://nanoporetech.com/). We are interested in characterizing the strengths and potential remaining challenges in using these technologies to annotate and quantify the transcriptomes of both model and non-model organisms.
The consortium will generate cDNA and direct RNA datasets using different platforms and protocols in [human](https://www.gencodegenes.org/human/), [mouse](https://www.gencodegenes.org/mouse/), and manatee samples. Participants will be provided with the data to generate annotations of expressed genes and transcripts and measure their expression levels. Evaluators from different institutions will determine which pipelines have the highest accuracy for different aspects, including transcription detection, quantification, and differential expression.

## Usage
1. Install [Nextflow](https://www.nextflow.io/) and [docker](https://www.docker.com/).
2. Clone this **repository**, and go to the root of this directory.
3. Download the public reference data from: https://drive.google.com/file/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
4. Perpare example data
   1. `public_ref`: Extract and copy `lrgasp_grcm39_sirvs.fasta` and `lrgasp_sirvs4.gtf` file (in `reference` folder) to `public_ref` folder
   2. `input_data`: Extract and copy `rna.fasta`, `entry.json`, and `experiment.json` file (in `mouse_SPbU_cDNA_PacBio` folder) to `input_data` folder 
5. Run the pipeline with the following command:
```
./build_dockers.sh 0.2.0
nextflow run main.nf
```
6. The results will be in the `test_results` directory.

## Repository Structure
```
LRGASP challenge 3 benchmarking project
│   README.md
│   main.nf
│   nextflow.config
└───validation
│   │   validation.py
│   │   ...
│
└───metrics
│   │   metrics.py
│   │   ...
│   
└───consolidation
│   │   manage_asssment_data.py
│   │   ...
│
└───full_data
│   │   input_data
│   │   public_ref
│   │   benchmark_ref
│   │   ...
│
└───test_result
    │   validation_result
    │   metrics_result
    │   consolidation_result
    │   ...
```