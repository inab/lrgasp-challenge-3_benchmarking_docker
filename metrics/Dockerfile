FROM condaforge/mambaforge-pypy3

WORKDIR /app

# Create the environment:
COPY sqanti3_lrgasp.yml .
RUN mamba env create -n sqanti_env -f sqanti3_lrgasp.yml
SHELL ["conda", "run", "-n", "sqanti_env", "/bin/bash", "-c"]

# Download and set-up cDNA_Cupcake
RUN apt-get update && apt-get install git && git clone https://github.com/Magdoll/cDNA_Cupcake.git && cd cDNA_Cupcake && git checkout d5432f3
RUN mv cDNA_Cupcake-24.0.0 cDNA_Cupcake
COPY . /app
ENV PYTHONPATH "${PYTHONPATH}:/app/cDNA_Cupcake/sequence/"
ENV PYTHONPATH "${PYTHONPATH}:/app/cDNA_Cupcake/"

RUN apt-get install libcurl4 libcurl4-openssl-dev -y

# The code to run when container is started:
COPY . /app
