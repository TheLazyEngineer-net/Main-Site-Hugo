# TheLazyEngineer Hugo Homepage

This repository is the code for thelazyengineer.net.

## Development

The development environment is created by the Nix package manager and the `flake.nix` file.

### Build Environment

The site is developed in a Nix environment containing Hugo and Node.  The Nix flake contains these expected versions when used:

```bash
nix develop
```

### Build Site

Building of the site is handled with Node.  The following are the most used scripts:

```bash
npm run build # builds develop
npm run build:prod # builds prod
npm run serve # builds and serves with Hugo
npm run serve:pagefind # builds and serves with Pagefind
```

## License

The intention of this repository's license is to make available all code as free and open source.  All code on this site is covered by the MIT License.  The content is not covered by this license and carries the usual copyright protections.
