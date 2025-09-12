+++
date = '2025-09-08'
title = 'Web Programming is Complex'
[params]
  featuredImage = 'svg/logo/nix-snowflake.svg'
+++

I call myself a backend software engineer.  This is mostly because my career and schooling never led me to the web.  To put it in perspective, I had to quicly learn HTML put together a "web" demonstration for my college senior project.  What I put together wasn't good, just a list of our data points to show that our app was live.  My first two jobs out of college had nothing to do with the fairly anemic websites of the companies that I worked for.  I instead wrote code that ran on the servers for users to interact with through other applications.  So, for years I cultivated my programming skills without really spending any time on web technologies, watching from a distance as Node and NPM became what they are, new Javascript frameworks rising and falling, and websites generally becoming much more useful and powerful.  I have never really understood what was going on or why, and I was ok with that.  I know that I can't know everything and I had accepted that my path was not leading me to the web.  I spent most of my free time learning about systems languages, functional programming, and systems administration.

That's not to say that I have never dipped my toes in to the web ocean.  Right after college I bought a Drupal book figuring that I should learn something about websites, and Wordpress was out because of my contrarian tendencies.  It didn't really hold my interest and I quickly gave up on learning more about Drupal.  There were ultimately too many metaphores that I didn't understand.  At some point Node started becoming a thing everyone was talking about.  I did some reading and thought it was a good idea for a month or two.  I couldn't figure out how it was useful for me, so I stopped my investigation into that as well.  After another year or two, I went through a book on Rails and Heroku, thought the deployment with Heroku was neat, but didn't really take much else away.  The web has never found a use in my projects, both personal and professional, so it just never stuck around in my musings for long.

Then one day I had the fantastic idea to create a quick website to try to share some of my knowledge in case it would be helpful to someone.  I am honest enought to know that it's hard to create a website when you don't really know how to create a website, even if you are a somewhat compentent software engineer.  As a result, I tried to make things fairly simple for myself.  I used a static site generator written in a language that I knew fairly well (Hugo in Go) in case I ever need to go digging through the code.  I have always struggled with CSS, it never quite does what I think it should (skill problem, I know), so I integrated Tailwind since everyone seems to be on that train at this point.  I made a simple rule for Javascript: minimize Javascript (i.e. no external libraries).  This should be the recipe for a fairly easy website, right?

After getting a basic skeleton running, the first little feature that I wanted to add was a light/dark mode button.  I like them, all the kids seem to have one these days, and I could see it was a well documented, contained problem.  It's at the top of the website next to the search bar.  Go ahead and click it a few times, I'm overly proud of getting the silly little thing functional.

I always have the desire to be able to do fairly simple things like this without Javascript, but as far as I can tell, that's not possible in any reasonable way.  The Tailwind CSS documentation had a good starting point for adding dark mode with some minimal Javascript.  I quickly realized that this was an incomplete solution for how a reasonable person would expect it to work (like it always is).  So, I got to read a bunch of random, internet-search implementations and AI slop, hoping to find a decent example to copy.  And, after that didn't work, I wrote my own derivative:

```javascript
// Light / Dark theme toggle
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themeToggleButtons = document.querySelectorAll("button[theme-toggle]");
  const toggleTheme = function (isDark) {
    localStorage.theme = isDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", isDark);
  };

  // change theme to current value in localStorage
  toggleTheme(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  // add click event handler to the buttons
  themeToggleButtons.forEach((el) => {
    el.addEventListener("click", function () {
      if ((theme = localStorage.getItem("theme"))) {
        toggleTheme(theme === "light");
      } else {
        toggleTheme(!document.documentElement.classList.contains("dark"));
      }
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (defaultTheme === "system" && !("theme" in localStorage)) {
        toggleTheme(e.matches);
      }
    });
})();
```

That seems like a lot of code for toggling some color values, so what is this even doing?  Well, even the first line of code is complex as far as I see it.  The actual code is wrapped in the function block `(function () { }()`.  It puts all the Javascript code that we care about into an anonymous function that is executed when the script is loaded by the browser.  This way, when the Javascript is executed, the variables and functions are not public, i.e. directly usable, to the code running in your browser because of the scoping rules of the language.  Only the top level, anonymous function can be used; which only sets up the site for further interactions and is anonymous anyway (it's difficult to call a funtion without a name).

All of this is pretty irrelevant for a toggle button.  If this code was public...who cares.  Call these functions, you can anyway even when they are hidden away.  However, the reason my eyes lit up was that this would scope all of these variable names to this anonymous function.  I wouldn't have to worry about having a variable with the same name in two separate, imported files, clobbering on a name, and having some bug that my poor brain would take days to finally figure out.  Seemed like an easy win to me for not a lot of effort.

The reason for doing this makes immediate sense to me with years of programming experience, but that's because of my programming intuition that public is bad unless desired (it's generally not desireable to give a person every possible gun to shoot themselves, the choice of gun alone would be cumbersome).  By wrapping the theme file within a function, we keep these variables/functions out of the global scope of the application, so we can't accidently use them in an unintended way.  How is a person starting out in programming going to have an intuition like this to know that this will save them time later?

To be fair, the first [Stack Overflow article](https://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li) that I found explained all of this better than I could, so at least the information for the function wrap is readily available.  But, besides adding a strange first line to my file, this also increased the nesting of the file by one.  I now have to hold in my head to ignore the wrapping function as it isn't pertinent to the executed code.  It isn't much, but I'm a dumb monkey with only so much space for remembering things.  My monkey eyes will keep fixating on the fact that I'm over one level of indentation so I need to know why.  Much like the silly Python `__init__.py` files, it just ends up being distracting.

Wow, that's a lot just for the first line of code, but at least we can now talk about the work that is being done.  The first thing that I did was set up some variables since Javascript, despite it's Lisp roots, likes imperative programming (and so do I when debugging my inevitably broken code):

```javascript
/* Generated using: hugo gen chromastyles --style=catppuccin-latte */

/* Background */ .bg { color:#4c4f69;background-color:#eff1f5; }
/* PreWrapper */ .chroma { color:#4c4f69;background-color:#eff1f5; }
/* Other */ .chroma .x {  }
/* Error */ .chroma .err { color:#d20f39 }
/* CodeLine */ .chroma .cl {  }
/* LineLink */ .chroma .lnlinks { outline:none;text-decoration:none;color:inherit }
/* LineTableTD */ .chroma .lntd { vertical-align:top;padding:0;margin:0;border:0; }
/* LineTable */ .chroma .lntable { border-spacing:0;padding:0;margin:0;border:0; }
/* LineHighlight */ .chroma .hl { background-color:#bcc0cc }
/* LineNumbersTable */ .chroma .lnt { white-space:pre;-webkit-user-select:none;user-select:none;margin-right:0.4em;padding:0 0.4em 0 0.4em;color:#8c8fa1 }
/* LineNumbers */ .chroma .ln { white-space:pre;-webkit-user-select:none;user-select:none;margin-right:0.4em;padding:0 0.4em 0 0.4em;color:#8c8fa1 }
/* Line */ .chroma .line { display:flex; }
/* Keyword */ .chroma .k { color:#8839ef }
/* KeywordConstant */ .chroma .kc { color:#fe640b }
/* KeywordDeclaration */ .chroma .kd { color:#d20f39 }
/* KeywordNamespace */ .chroma .kn { color:#179299 }
/* KeywordPseudo */ .chroma .kp { color:#8839ef }
/* KeywordReserved */ .chroma .kr { color:#8839ef }
/* KeywordType */ .chroma .kt { color:#d20f39 }
/* Name */ .chroma .n {  }
/* NameAttribute */ .chroma .na { color:#1e66f5 }
/* NameClass */ .chroma .nc { color:#df8e1d }
/* NameConstant */ .chroma .no { color:#df8e1d }
/* NameDecorator */ .chroma .nd { color:#1e66f5;font-weight:bold }
/* NameEntity */ .chroma .ni { color:#179299 }
/* NameException */ .chroma .ne { color:#fe640b }
/* NameLabel */ .chroma .nl { color:#04a5e5 }
/* NameNamespace */ .chroma .nn { color:#fe640b }
/* NameOther */ .chroma .nx {  }
/* NameProperty */ .chroma .py { color:#fe640b }
/* NameTag */ .chroma .nt { color:#8839ef }
/* NameBuiltin */ .chroma .nb { color:#04a5e5 }
/* NameBuiltinPseudo */ .chroma .bp { color:#04a5e5 }
/* NameVariable */ .chroma .nv { color:#dc8a78 }
/* NameVariableClass */ .chroma .vc { color:#dc8a78 }
/* NameVariableGlobal */ .chroma .vg { color:#dc8a78 }
/* NameVariableInstance */ .chroma .vi { color:#dc8a78 }
/* NameVariableMagic */ .chroma .vm { color:#dc8a78 }
/* NameFunction */ .chroma .nf { color:#1e66f5 }
/* NameFunctionMagic */ .chroma .fm { color:#1e66f5 }
/* Literal */ .chroma .l {  }
/* LiteralDate */ .chroma .ld {  }
/* LiteralString */ .chroma .s { color:#40a02b }
/* LiteralStringAffix */ .chroma .sa { color:#d20f39 }
/* LiteralStringBacktick */ .chroma .sb { color:#40a02b }
/* LiteralStringChar */ .chroma .sc { color:#40a02b }
/* LiteralStringDelimiter */ .chroma .dl { color:#1e66f5 }
/* LiteralStringDoc */ .chroma .sd { color:#9ca0b0 }
/* LiteralStringDouble */ .chroma .s2 { color:#40a02b }
/* LiteralStringEscape */ .chroma .se { color:#1e66f5 }
/* LiteralStringHeredoc */ .chroma .sh { color:#9ca0b0 }
/* LiteralStringInterpol */ .chroma .si { color:#40a02b }
/* LiteralStringOther */ .chroma .sx { color:#40a02b }
/* LiteralStringRegex */ .chroma .sr { color:#179299 }
/* LiteralStringSingle */ .chroma .s1 { color:#40a02b }
/* LiteralStringSymbol */ .chroma .ss { color:#40a02b }
/* LiteralNumber */ .chroma .m { color:#fe640b }
/* LiteralNumberBin */ .chroma .mb { color:#fe640b }
/* LiteralNumberFloat */ .chroma .mf { color:#fe640b }
/* LiteralNumberHex */ .chroma .mh { color:#fe640b }
/* LiteralNumberInteger */ .chroma .mi { color:#fe640b }
/* LiteralNumberIntegerLong */ .chroma .il { color:#fe640b }
/* LiteralNumberOct */ .chroma .mo { color:#fe640b }
/* Operator */ .chroma .o { color:#04a5e5;font-weight:bold }
/* OperatorWord */ .chroma .ow { color:#04a5e5;font-weight:bold }
/* Punctuation */ .chroma .p {  }
/* Comment */ .chroma .c { color:#9ca0b0;font-style:italic }
/* CommentHashbang */ .chroma .ch { color:#9ca0b0;font-style:italic }
/* CommentMultiline */ .chroma .cm { color:#9ca0b0;font-style:italic }
/* CommentSingle */ .chroma .c1 { color:#9ca0b0;font-style:italic }
/* CommentSpecial */ .chroma .cs { color:#9ca0b0;font-style:italic }
/* CommentPreproc */ .chroma .cp { color:#9ca0b0;font-style:italic }
/* CommentPreprocFile */ .chroma .cpf { color:#9ca0b0;font-weight:bold;font-style:italic }
/* Generic */ .chroma .g {  }
/* GenericDeleted */ .chroma .gd { color:#d20f39;background-color:#ccd0da }
/* GenericEmph */ .chroma .ge { font-style:italic }
/* GenericError */ .chroma .gr { color:#d20f39 }
/* GenericHeading */ .chroma .gh { color:#fe640b;font-weight:bold }
/* GenericInserted */ .chroma .gi { color:#40a02b;background-color:#ccd0da }
/* GenericOutput */ .chroma .go {  }
/* GenericPrompt */ .chroma .gp {  }
/* GenericStrong */ .chroma .gs { font-weight:bold }
/* GenericSubheading */ .chroma .gu { color:#fe640b;font-weight:bold }
/* GenericTraceback */ .chroma .gt { color:#d20f39 }
/* GenericUnderline */ .chroma .gl { text-decoration:underline }
/* TextWhitespace */ .chroma .w {  }
};
```

The `defaultTheme` variable allows for the default theme to be configured through Hugo and isn't particularly important to this discussion.  I don't currently use the variable (it just defaults), but I kept it to allow for the configurability.  The `themeToggleButtons` variable gets all of the button elements on the site that have the attribute 'theme-toggle'.  It is unnecessary to declare this variable as it is only used once, but it made verification during debugging easier and the compiler can kill it if it wants.  The final `toggleTheme` variable is a funtion to actually toggle the theme on the site by adding or removing the class 'dark' from the html element and site local storage.

I don't have too many complaints about the complexity of setting up these variables.  This isn't any harder than it is in any other language.  However, the Javascript methods for interacting with the DOM have provided me with plentiful headaches.  One has to pay special attention to what is being returned by each of these DOM functions.  Javascript, with and without Typescript, is a structurally typed language.  This is another way of saying that it is duck-typed (if it looks, smells, and sounds like a duck, then it's probably a duck).  Two objects are equivalent if they contain the same, pertinent values and functions.  There is no type checking beyond that.

What duck typing means to a programmer is that we get to find out about type errors during runtime.  An example that I ran into was the different between the `Node.childNodes` and `Element.children` Javascript properties.  These can be called on the things returned by, say, `document.querySelectorAll()`.  A thing to keep in mind is that an `Element` is a `Node`, but not necessarily the other way around.  In one instance, I had an Element, so I could get the `children` property without issue.  In another instance, I had a `DocumentFragment`, which is a `Node` and not an `Element`, so the `children` property was undefined.  I don't know what I am doing, noticed that `childNodes` was available, so I used that instead.

Well, there's a huge difference between these properties: `children` returns all child elements and `childNodes` returns all child nodes.  Now that I am writing this out, I see the names actually partially indicate this.  However, my dumb, monkey brain didn't notice this small difference, and I got to spend an hour trying to figure out why my Javascript was generating a bunch of dummy whitespace.  It was because I was iterating over text nodes that contained only whitespace characters and treating them as though they were elements within my template, all because I lazily swapped properties due to another runtime error.  A strongly typed language would have told me this at compile time, which is the upside of those languages in general.  The weak typing of Javascript combined with my lack of domain knowledge led to another difficult bug for me to track down.

Getting back to the light/dark mode toggle, there isn't much functionality left to speak of.  The first thing that I do is ensure the window is in the configured theme, if available.  This is done with:

```javascript
toggleTheme(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
```

I do my usual combining of too much logic in one line here, but nothing interesting is being accomplished.  Basically, I call the `toggleTheme` function defined earlier with a true/false value determined by whether the stored theme is dark or there is no stored theme and there is a dark theme configrued for the OS.  The logic is fairly simple.  However, more complication was created by this simple call.  First of all, many examples that I found had the `toggleTheme` type function defined in an HTML style block instead of in the Javascript file.  So, that's where I put it first.  Later, I couldn't find it because I forgot that I had put it in a different file.  I eventually moved it to the Javascript file to avoid this problem in the future.



After all these words, all that I have described is making one small, trivial button on my website.  That's not simple.  That's not easy.  I am, false modesty aside, a good software engineer.  I can break down and understand a problem better than most.  Despite this and some peripheral knowledge, I was consitently flummoxed with my site not doing what I thought I told it to do.
