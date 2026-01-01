SI-RSS generator

This is a nodejs project.

I want to track changes to this page: https://www.invader-spotter.art/news.php 
The page documents the creation, destruction, damage etc. of Space Invaders.

The items on this page are arranged in monthly sections and each item is for a given day that month. Note that the contents is in French.

I want to convert this page to RSS and Markdown.

The script should run hourly and be triggered by a GitHub Action.

The idea is to retrieve the page, convert it to RSS and Markdown, compare with a previously committed version in the GitHub repository. If there are changes then commit them via the GitHub Action. Otherwise do nothing (maybe send a message that the script has run but nothing changed).

Normally, I want to have an English version, but I can imagine that this could cause false positives regarding any changes to the page. So maybe we should store/commit the original page itself as it's probably the best way to check for changes.

For a given day, there can be one or several events as described at the beginning.
currently, the color of a Space Invader ID indicates the status (red: destruction, yellow: damage, green: new or reactivated, white: status change). Replace the colors with appropriate emojis.

I want you to create for each day, and entry in the RSS file.

The Markdown file and the RSS file should be available via a github.io page. The Markdown file should be rendered as an HTML file.

The refresh frequency of the RSS file should be 1 hour.

