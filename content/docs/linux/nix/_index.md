+++
title = 'Nix Package Manager'
linkTitle = 'Nix'
+++

### Introduction

The Nix package manager is an innovative binary manager that allows for completely reproducible environments.  Put another way, Nix allows you to download the exact same applications and libraries on Unix-like systems every time, as configured, and package it into a etherial, local environent.  For the developers out there, it's kind of like a (Docker) container, but in your shell with just symbolic links.

All of this is a little hard to conceptualize, so let's go through an example.  Let's say you wanted to write a console application using the Clang C compiler specifically for reasons.  The first step would be to check to see if Clang is already installed our system so we could compile the code.  If it isn't, we will have to install it.  Depending on the OS that we are using, this could be trivial or rather difficult.  Either way, it is indeterminate which version will be installed unless we download the compiler manually from a release site.  Most builtin package managers don't have much visibility into versioning, unless sought out.

Now, it could be that we need to use a library that requires an older version of Clang to compile since it hasn't been updated in years and uses some stupid removed macro or something.  This means the version of Clang being installed is important.  Checking the version that the package manager installed, we see that it is way too new.  Now we have to figure out how to get an older version.  There are many ways to do this, decisions to be made over where to put it, or maybe it can be versioned through the package manager.  Once all of this is resolved, we want our friend to try it out and send them the code.  It doesn't compile because their version of Clang is wrong and we get to start this process over.

Let's compare this with how we could do this using Nix.  First, we would add a file called `shell.nix` to our C application directory.  We use this file to define the environment needed for the development of our application.  In this case, we would add the Clang compiler to our environment.  It doesn't matter what is already installed on our system, Nix will download it's own version based on our configuration.  We can specify the exact version number of the compiler to download, Nix will download that source from the author's repository, compile it, and link it to our environment when called on to do so.  When we share our code with our friend, they can just run `nix-shell` in their console and have the exact same environment on their machine.  It nearly all of the normal complications in the developer experience.

There is a catch, as always.  Nix is also a functional language, and while it looks fairly harmless at first, it is a bit difficult.  This means to create this wonderful, reproducible environment, we have to learn a bit about this language.  This documentation is meant to aggregate and supplement what is currently available since it can be a bit daunting to navigate.

### Subsections

* [Installation](installation) - Some quirks related to installation
* [Derivations](derivations) - Aggregated documentation for creating new packages

### Useful Links

* [Nix Manual](https://nix.dev/manual/nix) - Official Nix manual
