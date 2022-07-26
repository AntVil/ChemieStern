# Contributing
### Editing Content
A contribution of content (text/formulae/images) should be done under the path `./src/content/`.

Each content is a folder with the name of the topic.
Inside of the folder there has to be a file named `content.txt`. Images are placed inside the subfolder `images`.

The `content.txt` file starts with the dependant topics.
After that there is the card content, which must contain the topic name. And in the end there is the main content. The three parts are seperated by three dashes (`---`).

An images is defined by brackets and the complete filename (`[image.svg]`).
Inline-math and block-math is defined with the dollar-symbol like in latex (`$x=1$` & `$$a^2=b$$`).
A table is defined using curly brackets (`{}`). The brackets and the content have to be on seperate lines. Between the brackets the `:`-symbol is used to seperate columns. Linebreaks seperate rows. Images and math can be used inside tables.

For examples check out the other content-files.

### Editing Code
Additional libraries should be put inside the folder `lib`.
Scripts, styles and global images should be put in their respective folders. Each page has it's own script and style file. The index files control behavior which surounds the pages. Code should be written in a similar style.
