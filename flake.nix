{
  description = "TheLazyEngineer Hugo Homepage";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    # flowviewer = {
    #   url = "https://raw.githubusercontent.com/node-red/flow-library/659323234a0569da8b23f6a20cd79b6bc5a050ee/public/js/flowviewer.js";
    #   flake = false;
    # };

    # iosevka = {
    #   url = "github:be5invis/Iosevka/v33.3.3";
    #   flake = false;
    # };
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            hugo
            nodejs_24
            tailwindcss-language-server
            ttfautohint
            vscode-langservers-extracted
          ];
        };
      });
}
