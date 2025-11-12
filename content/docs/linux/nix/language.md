+++
title = 'Nix Language'
linkTitle = 'Language'
description = 'A general outline of the Nix language'
summary = 'A general outline of the Nix language'
+++

## Introduction

Nix is the programming language for configuring the [Nix](/docs/linux/nix) package manager and [NixOS](/docs/linux/nixos).  It is a bit quirky with a different design philosophy than most other languages.  Nix is a declarative, pure, functional language that lazily evaluates statements in a reproducible way.  It seems quite difficult to use at first, but after using it for a bit, it's no worse than any other.

## Basic Derivation

We can start to understand Nix by by looking one of its most basic concepts: the derivation.  A derivation is the collection of instructions that is transformed into a Nix package.  Here is a simple derivation that will create a Nix package containing a simple bash script:

```nix {copy=true title="/hello-world.nix" caption="An excessively pointless derivation"}
{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "hello-world";
  buildCommand = ''
    echo '#!/bin/bash' > $out
    echo 'echo "Hello, World!"' >> $out
    chmod +x $out
  '';
}
```

Building this derivation will result in an Nix package named `hello-world` that is an executable bash file with the following contents:

```bash
#!/bin/bash
echo "Hello, World!
```

Executing this package prints "Hello, World!" to stdout on the terminal using bash.  While this isn't particulary useful, this derivation has the same pieces as any other Nix package.

### Structure

The derivation file is ultimately just a function definition.  There are multiple, equivalent ways of defining this function.  Let's take a look at the structure of this particular definition:

```nix
# function arguments
{ pkgs }:

# function call to mkDerivation,
# return is the derived bash file
pkgs.stdenv.mkDerivation {
  # arguments for mkDerivation,
  # contained within an atribute set (map)
}
```

The first line before the colon `:` are the expected arguments for this derivation.  The only argument is `pkgs` in this case.  This is the `nixpkgs` collection of all Nix packages and defualts to importing the environment's `nixpkgs` if this derivation is called without any arguments.  This is needed for the `stdenv` package and the `mkDerivation` function.

Next, the function `mkDerivation` is called to... make the derivation.  This is a convenience function since the primative `derivation` does not include an environment.  Things like GNU `make` and `gcc` aren't included in the `derivation` primative.  Since it is the last "line" of the file (function), its return value will be the return value of the derivation.

Lastly, the `mkDerivation` function will always require some arguments.  These are passed within an attribute set contained within `{ ... }`.  Attribute sets are just key-value pair maps, much like JSON objects.  In fact, they can usually be trivially converted to JSON.  The two attributes in the set given to `mkDerivation` are `name` and `buildCommand`.  Both have a string for an expected value.

### Attribute Sets

Every language needs a map type, and in Nix they are called attribute sets.  They are quite powerful and useed everywhere in Nix.  Attribute sets look both familiar to and a bit different from other languages:

```nix
{
  aString = "some string";
  aNumber = 12;
  aPath = /var/lib/hello;
  aList = [ 1 2 3 4 ];
  aFunc = x: x + 1;
  anEmptyAttr = { };
  anotherAttr = {
    anotherString = "some other string";
  };
}
```

Assignment of values for attributes is handled with the `=` (single equals) operator in Nix.  The end of every attribute assignment is handled with a `;` (semicolon).  You can assign pretty much anything to an attribute.  The `<nixpkgs>` package set is ultimately just a giant attribute set of all nix package derivations by name.

## Useful Links

- [Nix Language Tutorial](https://nix.dev/tutorials/nix-language.html) - Official tutorial of the Nix language, has a lot of useful information
