FROM        node:12-alpine
MAINTAINER  Form.io <support@form.io>

COPY        . /src
WORKDIR     /src
RUN         npm install

CMD  ["index.js"]
