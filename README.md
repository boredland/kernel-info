# run

`vercel dev`

## usage

### api

`?version=X.X` - searches for versions that start with given version number

`?category=longterm` - searches for versions that are in the given category

### action

see [here](https://github.com/boredland/kernel-info/blob/main/.github/workflows/test.yml) for a matrix build example.

## badges

![lts](https://img.shields.io/badge/dynamic/json?label=lts&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dlongterm)
![stable](https://img.shields.io/badge/dynamic/json?label=stable&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dstable)
![mainline](https://img.shields.io/badge/dynamic/json?label=mainline&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dmainline)
