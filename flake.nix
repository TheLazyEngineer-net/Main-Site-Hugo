{
  description = "TheLazyEngineer Hugo Homepage";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    daisyui = {
    	url = "https://github.com/saadeghi/daisyui/releases/download/v5.1.13/daisyui.js";
      flake = false;
    };

    daisyui-theme = {
      url = "https://github.com/saadeghi/daisyui/releases/download/v5.1.13/daisyui-theme.js";
      flake = false;
    };

    flowviewer = {
      url = "https://raw.githubusercontent.com/node-red/flow-library/659323234a0569da8b23f6a20cd79b6bc5a050ee/public/js/flowviewer.js";
      flake = false;
    };

    # iosevka = {
    #   url = "github:be5invis/Iosevka/v33.3.3";
    #   flake = false;
    # };

    tailwindcss-typography = {
      url = "https://github.com/tailwindlabs/tailwindcss-typography/archive/refs/tags/v0.5.19.tar.gz";
      flake = false;
    };
  };

  outputs = { self, nixpkgs, flake-utils, daisyui, daisyui-theme, flowviewer, tailwindcss-typography }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        serve-site = pkgs.writeShellApplication {
          name = "serve-site";
          runtimeInputs = with pkgs; [ hugo pagefind tailwindcss_4 ];
          text = ''
            if [ "''$#" -eq 1 ]; then
              OUTPUT=''$1
            else
              OUTPUT="."
            fi

            ${pkgs.hugo}/bin/hugo build "''${OUTPUT}"
            ${pkgs.pagefind}/bin/pagefind --site "''${OUTPUT}/public" --serve
          '';
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            hugo
            nodejs_24
            pagefind
            serve-site
            tailwindcss_4
            tailwindcss-language-server
            ttfautohint
            vscode-langservers-extracted
          ];

          shellHook = ''
            mkdir -p assets/js/lib
            ln -snf "${daisyui}" assets/js/lib/daisyui.js
            ln -snf "${daisyui-theme}" assets/js/lib/daisyui-theme.js
            ln -snf "${flowviewer}" assets/js/lib/flowviewer.js
            ln -snf "${tailwindcss-typography}" assets/js/lib/tailwindcss-typography

            # mkdir -p assets/fonts
            # rm -fr assets/fonts/iosevka
            # cp -r "$iosevka}" assets/fonts/iosevka
            # chmod -R u+rwx assets/fonts/iosevka
          '';
        };
      });
}
