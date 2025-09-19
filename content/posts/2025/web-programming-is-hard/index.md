+++
date = '2025-09-08'
title = 'Web Programming is Complex'
[params]
  featuredImage = 'svg/logo/nix-snowflake.svg'
+++

I have always worked as a backend software engineer.  Compared to my other programming knowledge, I am a luddite when it comes to the web.  My college didn't offer many web courses.  The only GUI course for undergrads used [Qt](https://www.qt.io/download-open-source#source-code), which was nice, but didn't have much to do with the web.  I remember having to quickly learn HTML so that I could hack together a web interface for our senior project.  It was an Android app and this seemed like the easiest way to show that our app data was actually being uploaded to Google App Engine.  I think the website ended up being just a list of heart rates (it was a heart-rate tracker) that you'd have to update by refreshing the page.  Since then, I've avoided GUI programming where possible and stayed nearly entirely on backend work.  I realized that I'm not a GUI guy years ago...they are too fiddly for my OCD brain.  The closest that I have come to the web in my career was making HTTP endpoints for the frontend services (the actual website) to use.

So what does a backend engineer do then?  The core of the job can be summed up as data manipulation and debugging.  Data comes in from one place, we do something with it, we might then trigger something else to happen, and we store that data for later use.  When something doesn't work as expected, we figure out why and fix it.  New features are really just modifying the data or data retrieval.  We live in code editors, log files, and terminal windows.  If the website or application is broken, we aren't a part of the conversation until they blame the data.  That's the life of a backend engineer.  The problems that arise are generally more interesting than it might seem from my description, and it was always a comfortable place for me to exist.

That is not to say that I have never dipped my toes into the ocean that is the web.  Right after college I bought a book on the Drupal framework since I was also trying to learn Python at the time.  It didn't really hold my interest for long and I quickly gave up on learning more about Drupal (and Python, but that's another story).  A couple of years later, Node came onto the scene and it seemed like a fantastic idea to me at first.  Ultimately, I couldn't figure out how it was useful for what I do, so I stopped my investigation into that as well.  Another time, I went through a book on Ruby on Rails and Heroku, loved everything about it, but never applied any of it since I wasn't making websites.  The web has never found a use in my projects, both personal and professional, so it just never stuck around in my musings for long.  I don't learn without doing, and I never had a website that I cared enough to make.

Then one day I had the fantastic idea of making a quick website to try to share some of the knowledge that I've accumulated (and save it for myself for when I forget).  Since I am a web-ignoramous, I tried to make things fairly simple for myself.  My first major decision was how to make the thing.  Straight HTML/CSS/JS was too daunting for me.  Using a website maker in a language that I knew seemed like a better idea.  This would allow me to go digging around in the code without much friction.  My website use case (documentation and blog) seemed like the perfect fit for static site generation, so the choice of site generator was quickly down to Jekyll and Hugo due to my language knowledge.  I've used Go more recently, and I like it for a number of reasons, so Hugo was an easy choice.  Hugo is often used as a Go language example project anyway, so I've dug around in their code base before trying to figure out how they implemented something or other.  It's not a bad code base to exist within.

Since I have always struggled with CSS, I wanted to try to find something easier than defining a bunch of classes in CSS files and trying to piece that mess together.  CSS never seems to want to work for me, or at least the way that I expect it to.  It's a complicated beast.  Certain syles will only work with certain elements.  The parent/child relationship can be very important in one case and basically meaningless in another.  Tailwind has been a hot topic for a couple of years now.  A number of vocal doubters have been completely won over by it.  I have read that it makes styling web components much easier, like in React, but many people seem to like using it pretty much everywhere.  Hugo and NixOS also made integrating this utterly trivial, so I didn't lose much time on that.  How I will fare with this CSS preprocessor instead of doing everything myself...only time will tell.

I made a simple rule for Javascript: as little as possible.  This site doesn't need some large framework like React or Svelte, so those were just ruled out.  I don't really want to run a server anyway.  JQuery was out as well...I don't know how to use it and it's surprisingly large.  Since I've always used something that made the Javascript more transparent (Rails and Phoenix come to mind), I figured that this would give me a better idea of what was actually going on behind the scenes.  That way, when it didn't work, I'd have a chance to be able to fix it.

Not much time later, after getting a basic site skeleton running on my computer (good job Hugo), the first little feature that I wanted to add was a light/dark mode button.  I have liked them since they made an appearance, all the kids seem to have one these days, and I could see it was a well documented, contained problem to learn a bit more about Tailwind and Javascript.  It's at the top of the website next to the search bar.  Go ahead and click it a few times, I'm pretty happy with how it turned out.

I always want to be able to do fairly simple things like this light/dark theming without Javascript, but as far as I can tell, it's just not possible.  The [Tailwind documentation](https://tailwindcss.com/docs) had a good starting point for adding dark mode with some minimal Javascript.  I quickly realized that this was an incomplete solution.  This meant that I got to read a bunch of internet-search implementations and AI-slop hoping to find a decent example to copy.  After that didn't work, I wrote my own derivative:

```javascript
// Light / Dark theme setup and toggling
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themes = new Set(["system", "light", "dark"]);
  const themeToggles = document.querySelectorAll("[theme-toggle]");

  const getTheme = function (isDark) {
    return (isDark === true || isDark === "dark") ? "dark" : "light"
  };

  const getMediaTheme = function () {
    return getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  const setSiteTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", getTheme(theme));
  };

  // initialization of theme on load
  let theme = (t = localStorage.theme) ? t : defaultTheme;
  if (!themes.has(theme)) { theme = "system"; }

  setSiteTheme(theme === "system" ? getMediaTheme() : theme);
  localStorage.theme = theme;

  // add click event handler to the buttons
  themeToggles.forEach((el) => {
    el.addEventListener("change", function () {
      const theme = el.checked ? "light" : "dark";

      setSiteTheme(theme);
      localStorage.theme = theme;
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.theme) { localStorage.theme = "system"; }
      if (localStorage.theme === "system") { setSiteTheme(getTheme(e.matches)); }
    });
})();
```

That seems like a lot of code for toggling some color values, so what is this even doing?  It's actually annoyingly complex.  Everything beings with the code being wrapped in the function block `(function () { ... })()`.  It puts all of this theme selector code into an anonymous function.  Anonymous just means nameless, or that the fucntion doesn't have a name.  If it doesn't have a name, you can't call it beyond where you define it.  It's even more complicated than that (you can actually call an anonymous function through great effort), but we don't need to get into that here.

All of this seems pretty irrelevant for a small amount of code for a toggle button.  If this code was callable, who cares?  Well, javascript isn't a particularly guarded language.  It's in fact annoyingly permissive most of the time.  The reason my eyes lit up when I saw this function wrapper was that this would scope all of these variable names to this anonymous function.  I wouldn't have to worry about having a variable with the same name in two separate, imported files, clobbering on a name, and having some bug that my poor brain would take days to finally figure out.  Seemed like an easy win to me for not a lot of effort.  It was like putting my `theme.js` file into an anonymous namespace.

My years of programming experience gave me this immediate intuition.  However, there was a lot of pain in gaining this intuition. It's generally not desireable to give oneself every possible gun to shoot themselves, the choice of gun alone would be cumbersome.  By wrapping the theme file within a function, we keep these variables/functions out of the global scope of the application, so we can't accidently use them in an unintended way or update state in an unintended place.  How is a person starting out in programming going to have this pain avoidance intuition?

To be fair, the first [Stack Overflow article](https://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li) that I found explained all of this better than I could, so at least that is readily available.  But, besides adding a strange first line to my file, this also increased the nesting of the entire file by one.  I now have to hold in my head to ignore the wrapping function as it isn't pertinent to the executed code.  It isn't much, but I'm a dumb monkey with only so much space for remembering things.  My monkey eyes will keep fixating on the fact that I'm over one level of indentation so I need to know why.  Much like the silly Python `__init__.py` files, it just ends up being distracting.

Wow, that's a lot just for the first line of code, but at least we can now talk about the work that is being done.  The first thing that I did was set up some variables since Javascript, despite it's Lisp roots, likes imperative programming (and so do I when debugging my inevitably broken code):

```javascript
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themes = ["system", "light", "dark"];
  const themeButtons = document.querySelectorAll("button[theme-toggle]");
```

The `defaultTheme` variable allows for the default theme to be configured through Hugo and isn't particularly important to this discussion.  It's just the default of 'system'.  The `themes` variable is just a list of the valid theme strings for this script.  Finally the `themeButtons` variable is all of the button elements on the page that have the attribute 'theme-toggle'.  All of this is fairly straightforward until on knows that `const`, in Javascript, does not mean what it does in other languages.  

Even stetting up variables can be a bit complicated in Javascript.  The Javascript methods for interacting with the DOM have provided me with plentiful headaches.  One has to pay special attention to what is being returned by each of these DOM functions.  Javascript, with and without Typescript, is a structurally typed language.  This is another way of saying that it is duck-typed (if it looks, smells, and sounds like a duck, then it's probably a duck).  Two objects are equivalent if they contain the same, pertinent values and functions.  There is no type checking beyond that.

One thing duck-typing often means to a programmer is that we get to find out about type errors during runtime.  An example that I ran into was the different between the `Node.childNodes` and `Element.children` Javascript properties.  These can be called on the things returned by, say, `document.querySelectorAll()`.  A thing to keep in mind is that an `Element` is a `Node`, but not necessarily the other way around.  In one instance, I had an Element, so I could get the `children` property without issue.  In another instance, I had a `DocumentFragment`, which is a `Node` and not an `Element`, so the `children` property was undefined.  I don't know what I am doing, noticed that `childNodes` was available, so I used that instead.

Well, there's a huge difference between these properties: `children` returns all child elements and `childNodes` returns all child nodes.  Now that I am writing this out, I see the names actually partially indicate this.  However, my monkey brain didn't notice this small difference, and I got to spend an hour trying to figure out why my Javascript was generating a bunch of whitespace elements.  It was because I was iterating over text nodes that contained only whitespace characters and treating them as though they were elements within my template, all because I lazily swapped properties due to another runtime error.  A strongly typed language would have told me this at compile time, which is the upside of those languages in general.  The weak typing of Javascript combined with my lack of domain knowledge led to another difficult bug for me to track down.

Getting back to the light/dark mode toggle, there isn't much functionality left to speak of.  The first thing that I do is ensure the window is in the configured theme, if available.  This is done with:

```javascript
toggleTheme(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
```

I do my usual combining of too much logic in one line here, but nothing interesting is being accomplished.  Basically, I call the `setTheme` function defined earlier with a true/false value determined by whether the stored theme is dark or there is no stored theme and there is a dark theme configrued for the OS.  The logic is fairly simple.  However, more complication was created by this simple call.  Many examples that I found had a `setTheme` like function defined in an style block with the HTML instead of in the Javascript file.  So, that's where I put it first.  Later, I couldn't find it because I forgot that I had put it in an HTML file.  I eventually moved it to the Javascript file to avoid this problem in the future.

Next we need to add the click action to our theme button elements, so when the user clicks the button it does something.  I chose to do this in Javascript since everything else was here, but it can also be done in the button element's HTML.  That is why people were putting this code in the the HTML like I mentioned in the previous paragraph.  I was happy to see the forEach functional programming function.  Javascript always seems to be screaming at you to write functional code, while stopping you from writing it so at every step.

The final bit of code just listens for changes to the system theme and changes the site theme accordingly.  This is found code for me, I never would have known how to do this.  Media queries are an area where I have little knowledge.  Combine that with adding an event listener to whatever is returned by matchMedia and I am confused.  Time to consult the docs.  So, matchMedia returns a MatchQueryList, which has some methods for adding listeners.  Ok, that's a lot, but now we are done.

After more work than I would like to admit, I have the button working.  I am not convince that my code is without problems or that I didn't do something completely wrong, but it works.  The problem was contained like I had hoped, but it was more difficult than I would have liked.  I have a theme toggle button that does mildly interesting things under the covers.  Javascript, once again, confirmed for me that it is extremely difficult to use.  I spent an hour reading about the "let" vs "const" debate, and feel no closer to understanding the language (though go team const, indication of intent is important for reading/maintaining code).  Basically, my head hurts, and I don't feel fulfilled like I do when coding in Elixir.

Why did I write this article then?  Partly to moan a bit, yes, but also partly to help others know that this is hard even when you are already a seasoned software engineer.  The final, and most important reason is that we need to recognize that this is, in fact, an extremely complex domain.  Some people seem to think that creating a website is easy; that anyone can learn to create a website.  While I agree with the sentiment, the reality is that this is really hard to do well.  Knowing that, it's rather terrifying to realize that most websites aren't made all that well.  Those poorly made websites take in people bank account information, addresses, emails, and any other bit of personal information necessary to do what the site needs to do (and possibly for some money on the side).  
