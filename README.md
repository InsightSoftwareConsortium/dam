# @itk-wasm/dam

Data Archive Manager (dam): a tool to prepare and download source code repository testing, example, and website asset data.

Data is stored in .tar.gz archives and can be hosted at multiple, redundant https URLs. A simpler, more flexible alternative to Git LFS, etc.

## Features

- Download and unpack testing and example data .tar.gz archives
- CLI for NPM scripts
- Verify with an expected hash compatible with web3.storage
- Cache archive downloads based on the expected hash
- Support for multiple storage urls
- Automatic retries

## Installation

```sh
npm install -g @itk-wasm/dam
```

## Usage

Store your data in a directory. For example:

```sh
> mkdir -p test/data
> touch test/data/file1.txt
> touch test/data/file2.txt
```

Pack the current version of the data into a compressed archive:

```sh
> dam pack test/data test/data.tar.gz
CID: bafkreibetv3747ysuplkqkwlomeaao3nk3uak7wtzgrgmrtvmah5jdyawy
```

Upload the *test/data.tar.gz* file to hosting services such as [web3.storage](https://web3.storage), GitHub Releases, AWS s3, a local http server, etc. For web3.storage, upload with the [`w3`](https://github.com/web3-storage/web3.storage) CLI:

```
> npm install --global @web3-storage/w3
> w3 token
> w3 put --name dam-test-data --no-wrap test/data.tar.gz
# Packed 1 file (0.0MB)
# bafkreibetv3747ysuplkqkwlomeaao3nk3uak7wtzgrgmrtvmah5jdyawy
⁂ Stored 1 file
⁂ https://w3s.link/ipfs/bafkreibetv3747ysuplkqkwlomeaao3nk3uak7wtzgrgmrtvmah5jdyawy
```

Note the `--no-wrap` flag.

In your NPM scripts, add

```sh
> dam download -v test/data test/data.tar.gz bafkreibetv3747ysuplkqkwlomeaao3nk3uak7wtzgrgmrtvmah5jdyawy https://w3s.link/ipfs/bafkreibetv3747ysuplkqkwlomeaao3nk3uak7wtzgrgmrtvmah5jdyawy
```

If the data is stored at multiple locations, add all URLs to the end of the `download` subcommand.

The first time this command is called the data will be downloaded and unpacked.

When data updates are required, repeat the pack / upload process, and update the content identifer (CID) hash.
