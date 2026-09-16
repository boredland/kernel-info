# kernel.manjaro.download

Little service that makes the kernel information from [kernel.org](https://kernel.org) accessible as a structured json file.

A [scheduled workflow](https://github.com/boredland/kernel-info/blob/main/.github/workflows/deploy.yml) scrapes kernel.org once an hour and deploys the rendered json to github pages.

## usage

### api

Static files, so what used to be query parameters are paths now. The payload shape is unchanged.

`https://kernel.manjaro.download/` - all the kernel information

`https://kernel.manjaro.download/version/X.X.json` - versions that start with the given version number

`https://kernel.manjaro.download/category/longterm.json` - versions that are in the given category

### action

This service can be used as a github action `boredland/kernel-info@version`.

see [here](https://github.com/boredland/kernel-info/blob/main/.github/workflows/test.yml) for a matrix build example.

## badges

![lts](https://img.shields.io/badge/dynamic/json?label=lts&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel.manjaro.download%2Fcategory%2Flongterm.json)
![stable](https://img.shields.io/badge/dynamic/json?label=stable&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel.manjaro.download%2Fcategory%2Fstable.json)
![mainline](https://img.shields.io/badge/dynamic/json?label=mainline&query=%24%5B%3A1%5D.version&url=https%3A%2F%2Fkernel.manjaro.download%2Fcategory%2Fmainline.json)

## development

```sh
bun install
bun run build   # writes dist/
```
