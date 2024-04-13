# kernel-info.manjaro-sway.download

Little service that makes the kernel information from [kernel.org](https://kernel.org) accessible as a structured json file.

The content of kernel.org is cached for one hour and responses are cached for an our.

## usage

### api

`https://kernel-info.manjaro-sway.download` - all the kernel information

`https://kernel-info.manjaro-sway.download?version=X.X` - searches for versions that start with given version number

`https://kernel-info.manjaro-sway.download?category=longterm` - searches for versions that are in the given category

### action

This service can be used as a github action `boredland/kernel-info@version`.

see [here](https://github.com/boredland/kernel-info/blob/main/.github/workflows/test.yml) for a matrix build example.

## badges

![lts](https://img.shields.io/badge/dynamic/json?label=lts&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dlongterm)
![stable](https://img.shields.io/badge/dynamic/json?label=stable&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dstable)
![mainline](https://img.shields.io/badge/dynamic/json?label=mainline&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel-info.manjaro-sway.download%2F%3Fcategory%3Dmainline)
