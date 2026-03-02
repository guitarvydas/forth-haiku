#!/bin/bash
tmp=tee-${RANDOM}
cat - >${tmp}
cat ${tmp} >"$1"
cat ${tmp}
rm -f ${tmp}
