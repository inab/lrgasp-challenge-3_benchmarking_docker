#!/usr/bin/env python3

from __future__ import division
import requests
import json
import os, io
import logging
import sys
from argparse import ArgumentParser
import datetime
from assessment_chart import assessment_chart

DEFAULT_eventMark = '2022-12-30'
DEFAULT_OEB_API = "https://dev-openebench.bsc.es/api/scientific/graphql"
DEFAULT_eventMark_id = "OEBE0010000010"
METRICS = {"precision": "OEBM0010000001", "TPR": "OEBM0010000002"}


def main(args):
    # input parameters
    data_dir = args.benchmark_data
    participant_path = args.participant_data
    output_dir = args.output
    offline = args.offline

    # Assuring the output directory does exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # read participant metrics
    participant_data = read_participant_data(participant_path)
    if offline is None:
        response = query_OEB_DB(DEFAULT_eventMark_id)
        getOEBAggregations(response, data_dir)
    generate_manifest(data_dir, output_dir, participant_data)


    with open(os.path.join(output_dir, "Manifest.json"), mode='r', encoding="utf-8") as f:
        manifest_data = json.load(f)

    with open(participant_path, mode='r', encoding="utf-8") as f:
        participant_data = json.load(f)

    # combine participant data with manifest data
    for manifest in manifest_data:
        participant_data.append(manifest)

    # add manifest to participant data
    with open(participant_path, mode='w', encoding="utf-8") as f:
        json.dump(participant_data, f, sort_keys=True, indent=4, separators=(',', ': '))






##get existing aggregation datasets for that challenges
def query_OEB_DB(bench_event_id):
    json_query = {'query': """query AggregationQuery($bench_event_id: String) {
    getChallenges(challengeFilters: {benchmarking_event_id: $bench_event_id}) {
        _id
        acronym
        metrics_categories{
          metrics {
            metrics_id
            orig_id
          }
        }
        datasets(datasetFilters: {type: "aggregation"}) {
                _id
                _schema
                orig_id
                community_ids
                challenge_ids
                datalink {
                    inline_data
                }
        }
    }
}""", 'variables': {'bench_event_id': bench_event_id}}
    try:
        url = DEFAULT_OEB_API
        # get challenges and input datasets for provided benchmarking event
        r = requests.post(url=url, json=json_query, headers={'Content-Type': 'application/json'})
        response = r.json()
        data = response.get("data")
        if data is None:
            logging.fatal("For {} got response error from graphql query: {}".format(bench_event_id, r.text))
            sys.exit(6)
        if len(data["getChallenges"]) == 0:
            logging.fatal(
                "No challenges associated to benchmarking event " + bench_event_id + " in OEB. Please contact OpenEBench support for information about how to open a new challenge")
            sys.exit()
        else:
            return data.get('getChallenges')
    except Exception as e:

        logging.exception(e)


# function to populate bench_dir with existing aggregations
def getOEBAggregations(response, output_dir):
    for challenge in response:

        challenge['datasets'][0]['datalink']["inline_data"] = json.loads(
            challenge['datasets'][0]["datalink"]["inline_data"])

        for metrics in challenge['metrics_categories'][0]['metrics']:
            if metrics['metrics_id'] == challenge['datasets'][0]['datalink']["inline_data"]["visualization"]["x_axis"]:
                challenge['datasets'][0]['datalink']["inline_data"]["visualization"]["x_axis"] = \
                metrics['orig_id'].split(":")[-1]
            elif metrics['metrics_id'] == challenge['datasets'][0]['datalink']["inline_data"]["visualization"][
                "y_axis"]:
                challenge['datasets'][0]['datalink']["inline_data"]["visualization"]["y_axis"] = \
                metrics['orig_id'].split(":")[-1]

        # replace tool_id for participant_id (for the visualitzation)
        for i in challenge['datasets'][0]['datalink']['inline_data']['challenge_participants']:
            i["participant_id"] = i.pop("tool_id")

        new_aggregation = {"_id": challenge['datasets'][0]['_id'], "challenge_ids": [challenge['acronym']],
            'datalink': challenge['datasets'][0]['datalink']}
        with open(os.path.join(output_dir, challenge['acronym'] + ".json"), mode='w', encoding="utf-8") as f:
            json.dump(new_aggregation, f, sort_keys=True, indent=4, separators=(',', ': '))


def read_participant_data(participant_path):
    participant_data = {}
    with open(participant_path, mode='r', encoding="utf-8") as f:
        result = json.load(f)
        for item in result:
            participant_data.setdefault(item['challenge_id'], []).append(item)

    return participant_data

def all_datafiles_for_challenge(data_dir, challenge):
    def json_files_for_challenge(base, challenge):
        for file in os.scandir(base):
            if file.name.startswith(challenge) and file.name.endswith('.json'):
                fnd = True
                yield file

    fnd = False
    nested_dir = os.path.join(data_dir, challenge)
    if os.path.isdir(nested_dir):
        yield from json_files_for_challenge(nested_dir, challenge)
    if not fnd:
        yield from json_files_for_challenge(data_dir, challenge)

def generate_manifest(data_dir, output_dir, participant_data):
    info = []
    for challenge, metrics in participant_data.items():
        added_challenge_to_manifest = False
        for challenge_oeb_data in all_datafiles_for_challenge(data_dir, challenge):
            print('loading ' + challenge_oeb_data.path)
            participants = []
            # Transferring the public participants data
            with io.open(challenge_oeb_data, mode='r', encoding="utf-8") as f:
                aggregation_file = json.load(f)
            # get id for metrics in x and y axis
            metric_X = aggregation_file["datalink"]["inline_data"]["visualization"]["x_axis"]
            metric_Y = aggregation_file["datalink"]["inline_data"]["visualization"]["y_axis"]

            # add new participant data to aggregation file
            new_participant_data = {}
            for metrics_data in metrics:
                participant_id = metrics_data["participant_id"]
                if metrics_data["metrics"]["metric_id"] == metric_X:
                    new_participant_data["metric_x"] = metrics_data["metrics"]["value"]
                    new_participant_data["stderr_x"] = metrics_data["metrics"]["stderr"]
                elif metrics_data["metrics"]["metric_id"] == metric_Y:
                    new_participant_data["metric_y"] = metrics_data["metrics"]["value"]
                    new_participant_data["stderr_y"] = metrics_data["metrics"]["stderr"]
                if 'metric_x' in new_participant_data and 'metric_y' in new_participant_data:
                    # copy the assessment files to output directory
                    new_participant_data["participant_id"] = participant_id
                    print("new participant_data: {}".format(new_participant_data))
                    aggregation_file["datalink"]["inline_data"]["challenge_participants"].append(new_participant_data)
                    new_participant_data = {}

            # add the rest of participants to manifest
            for name in aggregation_file["datalink"]["inline_data"]["challenge_participants"]:
                participants.append(name["participant_id"])

            #copy the updated aggregation file to output directory
            per_challenge_output = os.path.join(output_dir, challenge)
            if not os.path.exists(per_challenge_output):
                os.makedirs(per_challenge_output)
            summary_file = os.path.join(per_challenge_output, challenge_oeb_data.name)
            with open(summary_file, 'w') as f:
                json.dump(aggregation_file, f, sort_keys=True, indent=4, separators=(',', ': '))


            # Let's draw the assessment charts!
            assessment_chart.print_chart(per_challenge_output, summary_file, challenge, "RAW")
            #print_chart(per_challenge_output, summary_file, challenge, "SQR")
            #print_chart(per_challenge_output, summary_file, challenge, "DIAG")

            #generate manifest, only once per challenge, not per visualization variant
            if not added_challenge_to_manifest:
                obj = {
                    "id": challenge,
                    "participants": participants
                }
                info.append(obj)
                added_challenge_to_manifest = True

    with io.open(os.path.join(output_dir, "Manifest.json"), mode='w', encoding="utf-8") as f:
        json.dump(info, f, sort_keys=True, indent=4, separators=(',', ': '))



if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-p", "--participant_data", help="path where the data for the participant is stored",
                        required=True)
    parser.add_argument("-b", "--benchmark_data", help="dir where the data for the benchmark will be or is stored",
                        required=True)
    parser.add_argument("-o", "--output",
                        help="output directory where the manifest and output JSON files will be written", required=True)
    parser.add_argument("--offline",
                        help="offline mode; existing benchmarking datasets will be read from the benchmark_data", default=True,
                        required=False, type=bool)
    args = parser.parse_args()

    main(args)
