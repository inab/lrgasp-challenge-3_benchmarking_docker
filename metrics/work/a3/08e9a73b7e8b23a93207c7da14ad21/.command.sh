#!/bin/bash -ue
source activate sqanti_env
python /app/sqanti3_lrgasp.challenge3.py /media/tian/ubuntu/data4Tian/mouse_SPbU_cDNA_PacBio/rna.fasta /media/tian/ubuntu/data4Tian/reference/lrgasp_sirvs4.gtf /media/tian/ubuntu/data4Tian/reference/lrgasp_grcm39_sirvs.fasta -d /media/tian/ubuntu/test -o "submission_test"
