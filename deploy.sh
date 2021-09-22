#!/bin/bash

SFTP_HOST=ftp.fewmans.xyz
SFTP_USER=fewmzett
SFTP_PORT=21098

sftp -i ~/.ssh/id_rsa "sftp://${SFTP_USER}@${SFTP_HOST}:${SFTP_PORT}" -b <<-END
  cd /home/fewmzett/fewnodeback
  put index.js
  put packege.json
  lcd src
  cd src
  put -r .
  bye
END
