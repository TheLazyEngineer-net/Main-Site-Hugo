+++
date = '2025-09-18'
title = 'The Complexity of Making a Button'
authors = ['Jared Suess']
description = 'A simple button opens a up a world of Javascript complexity'
tags = ['Programming', 'Javascript', 'Rant']
[params]
  featuredImage = 'svg/logo/js.svg'
  [params.quote]
    text = 'Controlling complexity is the essence of computer programming.'
    author = 'Brian Kernighan'
+++

Web programming is a complex beast.  Javascript breaths complexity into a simple theme toggle button for this website.

<!--more-->

I have never been paid to make a website.  Leaving college, I was hired to do backend work and my career never pushed me away from that text-based world.  While I have spent some time investigating various web technologies over the years, none of it ever held more than a passing fancy compared with other things.  However, that all changed when I wanted to make this website.

Being a programmer and knowing that I wanted some specialized functionality, I opted to create this site from scratch using existing tooling.  Like all decisions, this one has consequences.  I am once again finding that complexity seems to follow from the simplest of things when it comes to web programming.  Even a simple theme toggle button was harder to implement than I would have thought.

Getting the initial site skeleton up and running took almost no time thanks to Hugo.  After this, I decided to start with a small, contained problem.  I knew my lack of web-knowledge would trip me up, so something with good documentation would be key.  This led me to to a light/dark theme toggle button.  It toggles the color-theme of the page from light to dark.  I prefer reading text on a dark background, so I wanted to add that option to this site.  It seemed like the simplest of things, just change some attribute or class in the HTML element and CSS would take care of the rest.  There were many examples from companies who make money and pay people to write documentation.  This should have been a decent starting point for a webidiot like me.

### Implementation

I began the toggle button implementation by trying to see if I could do this without Javascript, but that quickly didn't seem possible.  Next, I turned to the [Tailwind documentation](https://tailwindcss.com/docs/dark-mode).  I had decided to follow the Tailwind hype-train and they had an example for how to add dark mode.  I quickly realized that this was an incomplete solution for how I wanted this to work.  This meant that I got to read a bunch of GitHub implementations and AI-slop hoping to find some decent examples to get the rest of the logic that I needed.  I eventually settled on my own derivative:

```javascript
// Light / Dark theme setup and toggling
(function () {
  const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
  const themes = new Set(["system", "light", "dark"]);
  const themeToggles = document.querySelectorAll(
    'input[theme-toggle], input[type="checkbox"]',
  );

  const isDark = function (val) {
    return val === true || val === "dark";
  };

  const getTheme = function (val) {
    return isDark(val) ? "dark" : "light";
  };

  const setPageTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", getTheme(theme));
    // Note: checked checkbox => dark mode
    themeToggles.forEach((e) => (e.checked = isDark(theme)));
  };

  // initialization of theme on load
  let theme = (t = localStorage.theme) ? t : defaultTheme;
  if (!themes.has(theme)) {
    theme = "system";
  }

  setPageTheme(
    theme !== "system"
      ? theme
      : getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
  localStorage.theme = theme;

  // add click event handler to the buttons
  themeToggles.forEach((el) => {
    el.addEventListener("change", function () {
      setPageTheme(el.checked);
      localStorage.theme = getTheme(el.checked);
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.theme) {
        localStorage.theme = "system";
      }
      if (localStorage.theme === "system") {
        setPageTheme(getTheme(e.matches));
      }
    });
})();
```

### The Wrapper Function

That seems like a lot of code for toggling an attribute.  The Javascript begins with the useful code being wrapped in a 'self executing anonymous function': `(function () { ... })()`.  It puts the theme selector code into an anonymous function that will be called when this code is loaded (at the end of the body in this case).  Anonymous just means nameless, or that the function doesn't have a name.  If it doesn't have a name, then you can't call it beyond where you define it since you need a name to call a function (or where to goto).

My years of programming experience gave me the spidey-sense that this was a nice feature.  By wrapping the theme toggle code within an anonymous function, we keep these variables/functions out of any scope ouside of this function.  This way, we can't accidently use them in an unintended way or update some state in an unintended place.  I've spent hours (weeks probably) debugging that sort of thing and don't want to repeat it anytime soon.

However, I spent a while looking into this function wrapper after discovering it.  It did what I thought it did, but then I had to figure out when this was usually used, are there downsides, etc.  The conclusion that I came to was to just use it for things like this toggle-button since no one should be accessing anything going on in there, but it took some research time to come to that conclusion.

The first [Stack Overflow article](https://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li) that I found explained all of this better than I can, so at least that was readily available.  However, beyond the research time, this code is ugly and increases the indent level with the first thing that we do.  Much like the Python `__init__.py` file, this is mental baggage that I now have to keep around.  This is unintended complexity being introduced into the system.  A lot has to be understood before even writing a line of code.

### Trivial Variables

Finally, it was time to start writing some code.  The first thing that I did was set up some variables since Javascript, despite it's Lisp roots, likes to push us towards imperative programming (to be fair, it does make debugging easier):

```javascript
const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
const themes = new Set(["system", "light", "dark"]);
const themeToggles = document.querySelectorAll('input[theme-toggle], input[type="checkbox"]');
```

The `defaultTheme` variable allows for the default theme to be configured through the Hugo static site generator and isn't particularly important to this discussion.  It's just the default of 'system' on this site.  The `themes` variable is a set of the valid theme strings for this script.  It's mildly pointless but can be considered a decent abstraction.  Finally, the `themeToggles` variable is a collection of the checkbox inputs on the page that have the attribute 'theme-toggle'.  All of this was fairly straightforward until I learned more about `const` in Javascript.

### The 'const' Thing

Theres's currently discussion within the community to not even use `const` since it doesn't do what people expect it to.  Constants in Javascript do not enforce that the value remains constant, only that the variable reference doesn't change.  You can't reassign a constant variable to another value, but you can update the existing value.  It means the pointer is constant, not the pointed-to value.

Well, I quickly realized that I didn't care, made a mental note about this, and kept using `const` since I like that it shows intent even if it doesn't enforce variable const-ness.  Again though, I was doing something seemingly simple, why did I have to take a ten minute detour into this discussion?  I knew more afterwards, but all it would have taken was a quick "hey, this is what 'const' means, use it accordingly".

### Functional Programming

Now that we have the variables set up, we need some functions to do some things:

```javascript
const isDark = function (val) {
  return val === true || val === "dark";
};

const getTheme = function (val) {
  return isDark(val) ? "dark" : "light";
};

const setSiteTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", getTheme(theme));
  themeToggles.forEach((e) => (e.checked = isDark(theme)));
};
```

I've spent enough time in functional programming land to not come away untouched.  In other words, these functions are in no way necessary and the logic is quite terse.  The content of these functions could be moved to where it is used and little clarity would be lost.  However, some clarity would be lost and these provides for a cleaner implementation.  We can start our discussion at the top with `isDark(val)` and see why Javascript can be fun.

### Seriously, Javascript can be good

This first function will return true if passed `true` or `"dark"`, and false otherwise.  In the typed language world (normal for me), this is not one function but two.  One would have to write one function for each type (string and boolean).  If something other than those types is passed, the code won't compile.  Javascript's loosey-goosey relationship with types allows for extremely precise, safe, and clear code in this case.

We also get our first introduction into another Javascript complication within this function: the triple-equals.  Much like `const`, the equality operator "==" in Javascript doesn't do what people expect.  In normal languages, the equality operator returns true or false for whether two things are equal (`5 == 5` is true, `"five" == 5` is false).  In Javascript, the equality operator allows for type coercion first before testing whether the two values are equal.  In other words, if Javascript has a way to make two types the same for comparison, it will.  This means that `"5" == 5` is true in Javascript (or the string "5" is equal to the integer 5), unlike in basically every other language.

Because Javascript is quite aggresive with type coercion, unexpected results occur.  That is why the triple-equals "===" operator exists within Javascript, to test for equality without type coercsion.  The types of the arguments must be the same for the triple-equals to return true.

In the context of the `isDark` function, the triple-equals operators type-check that the `val` parameter is either a boolean or a string in order for it to return true.  This enforces exactly the behavior that I desired, though the check happens at runtime.  It also means that if anything else is passed (like accidently passing `null` or `undefined`), the function will just return false and the program will proceed as normal.  For a theme-toggle, this would be preferable: have the color scheme wrong but the page still load.

Now that we have all this nice behavior wrapped in the `isDark` function, we can reuse it within `getTheme` to return a string version of this value that can be used within the site.  This allows us to further combine with the `setSiteTheme` function to set the theme for the site.  It will set the "data-theme" attribute on the page to the color scheme along with all themetoggle checkboxes to the correct value.

### Doing Stuff

Finally, we can get to the actual logic of this theme-toggle.  Not much actually has to be done now.  First we need to initialize the site:

```javascript
// initialization of theme on load
let theme = (t = localStorage.theme) ? t : defaultTheme;
if (!themes.has(theme)) {
  theme = "system";
}

setSiteTheme(
  theme !== "system"
    ? theme
    : getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches),
);
localStorage.theme = theme;
```

The first new concept we bring in here is local storage.  This is a place for sites to "store" information "locally" on the user's computer.  It's often used for cookies, tokens, and site settings.  Here we are using it to store the user's preference for their color theme.  This seems to be the way people do this so I followed suit.

The initialization merely gets the stored theme (if available), checks to make sure it's valid, then sets the site's theme to that.  It will also check to see if the dark color scheme is a system preference if the theme is set to "system".

### Listening for Changes

Since the site is now initialized to the currently configured value, we can move on to adding listeners for changes to the theme:

```javascript
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
```

The first method on the `themeToggles` variable adds a listener for every toggle configured on a page.  This listens for change events and calls the anonymous function defined inline.  The `setSiteTheme` function will synchonize the theme toggles on the page and update the theme.  I view setting the checkbox as setting the user preference, so it also sets the localStorage to the current value for future page loads.

Figuring out how to set up these listeners took some time.  Most examples that I found are some variation of what I eventually settled on, but there's a lot to parse here.  The first thing to figure out was which event or events to listen to.  This is an input element, so that was a starting point, but then I wanted to make sure the events weren't different for a checkbox.  I eventually settled on the "change" event since it seemed to get me everything that I wanted.

Next, I had to figure out how to get the current state of the checkbox from the element.  Here, it matters that this is a checkbox input and not just an input, unlike with the listening event type.  There is a `checked` property on checkboxe elements that gives me the correct value without any conversion of a generic value.  It took me a surprising amount of time, even writing this article, to find [proper documentation for it](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checked).  Connecting that this was an available property only came to me through research after seeing it in an example.

Finally, I found out that one might want to listen to system theme preference updates through a media query, again, through reading found, example code.  This was another new concept to learn about.  Apparently, you can query the media type of the screen to find out more information about it, if you care.  I don't yet, but apparently I do since one of these queries is to see if the user has configured a preferred color theme of "light" or "dark".  There's a ton more to these, but this query allows the Javascript to check if the user has configured a dark theme preference, and if this changes, adjusts the site theme accordingly if it is set to the default of "system" theme.  In my system, since I have KDE Plasma configured to use its default dark theme, this means my site will defaut to dark without me needing to click the theme toggle for my preference.

### Summation

After more work than I would like to admit, I have the theme-toggle button working.  I am not convinced that my code is bug-free or correct in any way, but it seems to work reliably.  The implementation problem was contained, like I had hoped, but it was more difficult than I would have liked or expected.  Javascript, once again, confirmed for me that it is extremely difficult to use in practice.  The interactions between HTML, CSS, and Javascript is an immense topic.  Basically, my head hurts, and I don't feel a fullfilling sense of accomplishment like I do when coding in languages like Elixir, Lisp, or even Go.

Why did I write this article then?  Partly to moan a bit, yes, but also to help others know that web programming is hard even when you are a seasoned software engineer.  This is an extremely complex domain containing decades of decisions that continue to have consequences.  At times, it is marketed as though web programming is easy to learn and that anyone can do it.  While I agree with the sentiment and would agree with this to a point, the reality is that complexity scales difficulty exponentially.  Combine that with the understandable incentive to push out new websites and we see why the web is often the hacky mess that many parts of it are.

We need to treat realm of web programming with the respect that it deserves.  It is a major driver of the modern world.  Websites with Javascript are now applications relied on by billions of people daily.  And yet, there is a distain at times for web programming, often well deserved.  This is due, in some part, to the complexity of making a theme-toggle button.  That much expertise for such a simple task is a large ask, and this button is not even doing anything interesting.
