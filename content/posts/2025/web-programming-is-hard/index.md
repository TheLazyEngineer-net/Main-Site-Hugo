+++
date = '2025-09-08'
title = 'The Complexity of Making a Button'
[params]
  featuredImage = 'svg/logo/js.svg'
+++

I have never been paid to make a website.  Since I wasn't hired out of college to do web programming, I never had much career motivation to move in that direction.  It also seemed so messy compared to the structured world of language versions and standard libraries in which I was entrenched since college.  Recently, I wanted to make a quick (heh) website, so here I am in web world.  What I am finding here is that complexity seems to follow from the simplest of things.  Even a simple toggle-button was harder to implement than I would have thought.

When beginning the work on this website, I needed a contained starting point.  I knew my lack of knowledge would trip me up, so something small, common, and well documented seemed to be a good choice.  This led me to to a theme-toggle button.  It toggles the color-theme of the page from light to dark.  I have liked them ever since they made an appearance.  I prefer reading text on a dark background, so it's nice to have the option.  It seemed like the simplest of things, just change some attribute or class in the HTML element and CSS would take care of the rest.  There were many examples from companies who make money and pay people to write documentation.  This theoretically should have been an easy baptism into the web.

I began the toggle-button implementation by trying to see if I could do this without Javascript, but that didn't seem possible.  Next, I turned to the [Tailwind documentation](https://tailwindcss.com/docs) since I had decided to use TailwindCSS and they had an example for how to add dark mode.  I quickly realized that this was an incomplete solution for how I would want this to work.  This meant that I got to read a bunch of GitHub implementations and AI-slop hoping to find some decent examples to get the rest of the logic that I needed.  I eventually settled on my own derivative:

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

That seems like a lot of code for toggling an attribute.  So what is this even doing?  The whole thing begins with the actual code being wrapped in a 'self executing anonymous function': `(function () { ... })()`.  It puts all of this theme selector code into an anonymous function that will be called when this code is loaded.  Anonymous just means nameless, or that the function doesn't have a name.  If it doesn't have a name, then you can't call it beyond where you define it since you need a way to reference the function to call it.

My years of programming experience gave me the spidey-sense that this was a nice feature.  By wrapping the theme toggle code within an anonymous function, we keep these variables/functions out of the global scope of the site.  This way, we can't accidently use them in an unintended way or update some state in an unintended place.  I've spent hours debugging that sort of thing and don't want to repeat it anytime soon.

However, I spent a while looking into this fucntion wrapper after discovering it.  It did what I thought it did, but then I had to figure out when this was usually used, are there downsides, etc.  The conclusion that I came to was to just use it for things like this toggle-button since no one should be accessing anything going on in there, but time was spent getting there.

The first [Stack Overflow article](https://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li) that I found explained all of this better than I could, so at least that was readily available.  But...this code is ugly and increases the indent level with the first thing that we do.  Much like the Python `__init__.py` file, this is mental baggage that now has to be kept.  This is unintended complexity being introduced into the system.  We've already discussed a lot before even writing any of the code for the button.

Alright, we can move on to the code that does stuff.  The first thing that I did was set up some variables since Javascript, despite it's Lisp roots, likes to push us towards imperative programming (to be fair, it does make debugging easier):

```javascript
const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
const themes = new Set(["system", "light", "dark"]);
const themeToggles = document.querySelectorAll("[theme-toggle]");
```

The `defaultTheme` variable allows for the default theme to be configured through the Hugo static site generator and isn't particularly important to this discussion.  It's just the default of 'system'.  The `themes` variable is a set of the valid theme strings for this script.  It's kind-of pointless but lets me write something cleaner later.  Finally the `themeToggles` variable is a collection of the elements on the page that have the attribute 'theme-toggle'.  All of this was fairly straightforward until I learned more about `const` in Javascript.

Theres's currently discussion within the community to not even use `const` since it doesn't do what people expect it to.  Constants in Javascript do not enforce that the value remains constant, only the variable reference.  You can't reassign a constant variable to another value, but you can update the existing value.  It means the pointer is constant, not the pointed-to value.

Well, I quickly realized that I didn't care, made a mental note about this, and kept using `const` since I like that it shows intent even if it doesn't enforce it.  Again though, I was doing something seemingly simple, why did I have to take a 30 minute detour into this discussion?  I knew more afterwards, but all it would have taken was a quick "hey, this is what 'const' means, use it knowing this".

Now that we have the variables set up, we need some functions to do some things.  The following functions are just for simplicity of code:

```javascript
const getTheme = function (isDark) {
  return (isDark === true || isDark === "dark") ? "dark" : "light"
};

const getMediaTheme = function () {
  return getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
};

const setSiteTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", getTheme(theme));
};
```

Each of these simple functions mearly wrap some code that was repeated or ugly.  It makes the actual logic look cleaner.  The fun bit with the `getTheme()` function is that it can take in any argument and give a useful, expected value back.  The only way to get it to return "dark" is to pass it true or the string "dark".  Otherwise it returns "light".  Javascript's Lisp aspirations made apparent.

Why is this fun?  I tend to like strongly typed languages.  Javascript isn't one of those.  It's what's called a duck-typed language.  If it looks like a duck and quacks like a duck, then...it's a duck.  In programming, this means that you can pass whatever to a function/method and as long as it looks like what is expected, everything will proceed normally.  If you pass something that doesn't look like what's expected...you get a runtime error.

In a strongly-typed language, the compiler wouldn't be happy with having a function that takes a string or a boolean.  They usually expect one or the other.  If you need both, you need two functions.  If you want to handle the general case...maybe you can with inheritance?

This just isn't a thing in Javascript, and sometimes that's nice.  It means you can encapsulate a lot of logic in very little code.  The downside is that...it's complicated.  You are encasulating a lot of logic in very little code.  I've made it even worse using a ternary operator to get rid of the if/else statement that looks so ugly to me to get this into one line.  Even more complexity, and we haven't done anything.

The other two functions are boring wrappers.  They make more sense later when used in context.  Here, they just combine the `getTheme()` with their own logic.

Now that everything is setup, we can get to talking about what this code is going to be doing.  We need to make sure we are listening for changes to the checkbox button (i.e. someone clicked on the button) and if someone changes the system theme in the case it hasn't been manually selected by the button.  When these things happen, we might need to take action:

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

When a user clicks the theme-toggle button, I call the `setSiteTheme()` function, defined earlier, with a true/false value determined by the value of the checkbox.  The logic is fairly simple.  However, more complication was created by this simple call.  Many examples that I found had a `setTheme` like function defined in an style block with the HTML instead of in the Javascript file.  So, that's where I put it first.  Later, I couldn't find it because I forgot that I had put it in an HTML file.  I eventually moved it to the Javascript file to avoid this problem in the future.

Next we need to add the click action to our theme button elements, so when the user clicks the button it does something.  I chose to do this in Javascript since everything else was here, but it can also be done in the button element's HTML.  That is why people were putting this code in the the HTML like I mentioned in the previous paragraph.  I was happy to see the forEach functional programming function.  Javascript always seems to be screaming at you to write functional code, while stopping you from writing it so at every step.

The final bit of code just listens for changes to the system theme and changes the site theme accordingly.  This is found code for me, I never would have known how to do this.  Media queries are an area where I have little knowledge.  Combine that with adding an event listener to whatever is returned by matchMedia and I am confused.  Time to consult the docs.  So, matchMedia returns a MatchQueryList, which has some methods for adding listeners.  Ok, that's a lot, but now we are done.

After more work than I would like to admit, I have the button working.  I am not convince that my code is without problems or that I didn't do something completely wrong, but it works.  The problem was contained like I had hoped, but it was more difficult than I would have liked.  I have a theme toggle button that does mildly interesting things under the covers.  Javascript, once again, confirmed for me that it is extremely difficult to use.  I spent an hour reading about the "let" vs "const" debate, and feel no closer to understanding the language (though go team const, indication of intent is important for reading/maintaining code).  Basically, my head hurts, and I don't feel fulfilled like I do when coding in Elixir.

Why did I write this article then?  Partly to moan a bit, yes, but also partly to help others know that this is hard even when you are already a seasoned software engineer.  The final, and most important reason is that we need to recognize that this is, in fact, an extremely complex domain.  Some people seem to think that creating a website is easy; that anyone can learn to create a website.  While I agree with the sentiment, the reality is that this is really hard to do well.  Knowing that, it's rather terrifying to realize that most websites aren't made all that well.  Those poorly made websites take in people bank account information, addresses, emails, and any other bit of personal information necessary to do what the site needs to do (and possibly for some money on the side).
