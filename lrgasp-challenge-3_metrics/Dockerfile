FROM continuumio/miniconda3

WORKDIR /app
RUN apt-get -y update && apt-get install -y libzbar-dev
# Create the environment:
COPY sqanti3_lrgasp.yml .
RUN conda install -c conda-forge mamba
RUN mamba env create -n sqanti_env -f sqanti3_lrgasp.yml

# Download and set-up cDNA_Cupcake
RUN apt-get update && apt-get install git && git clone https://github.com/Magdoll/cDNA_Cupcake.git && cd cDNA_Cupcake && git checkout d5432f3
RUN apt-get install -y libcurl4
COPY . /app
WORKDIR /app/cDNA_Cupcake/

SHELL ["conda", "run", "-n", "sqanti_env", "/bin/bash", "-c"]
# specific scikit-learn for python 3.7
RUN conda install scikit-learn=0.20
RUN python setup.py build
RUN python setup.py install
WORKDIR /app
ENV PYTHONPATH "${PYTHONPATH}:/app/cDNA_Cupcake/sequence/"
ENV PYTHONPATH "${PYTHONPATH}:/app/cDNA_Cupcake/"

# The code to run when container is started:
COPY . /app
