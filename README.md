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

The intention of this repository's license is to make available all code and documentation as free and open.  Everything in this repository is under the MIT License EXCEPT for the content folder.  The content is not code or documentation, so not technically covered by the license anyway.
