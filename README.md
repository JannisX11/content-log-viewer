# Content Log Viewer
Minecraft Bedrock Edition Content Log Viewer.

The content log in Minecraft Bedrock Edition provides valuable information while developing add-ons and worlds, but it is hard to navigate. This web-based tool aims to solve that.

The app can parse content logs and log files and display the error messages in a neat and organized way. The interface groups them by configurable attributes and makes the list searchable.

**Project Status:** Work in Progress

## How to use

App: [Content Log Viewer](https://jannisx11.github.io/content-log-viewer/)

### Workflow:
1. Open the app
2. Paste your log (press Ctrl + V, click Paste Log, or drop a file).
3. View your list of issue groups, open groups to look at individual issues.
4. Use the tabs on top to switch how issues are grouped
5. Click an individual issue to view details and info on how to fix it


## Contributions

There are a lot of issue types, and a lot of info regarding those issues, so contributions are always welcome!

### Report missing log messages

If certain issues from a pasted log appear in the "Other issue" category, they are not handled by this app yet.

Open an issue to report one or multiple missing error messages. Make sure to include an example log output.


### Add new types

To contribute new issue types, open [issue_types.ts](src/scripts/issue_types.ts) and add your issue to the existing IssueTypes list.
The individual values are explained in the JSDoc comments.

Install [Node](https://nodejs.org/), run `npm install` and then `npm run dev` to launch the app locally. Test your changes by pasting a log from Minecraft into the app.

Once everything is working, create a pull request to submit your changes.

