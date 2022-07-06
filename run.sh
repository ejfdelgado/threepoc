#!/bin/bash
#export GOOGLE_APPLICATION_CREDENTIALS='/home/ejfdelgado/desarrollo/threepoc/llaves/paistv-5087a82b438a.json'
export GOOGLE_APPLICATION_CREDENTIALS='/home/ejfdelgado/desarrollo/threepoc/llaves/proyeccion-colombia1-b492ce8a0bae.json'
export GAE_APPLICATION="paistv"
gcloud config set project paistv
npm run start