const path = require('path');
const fs = require('fs-extra');

const README_PATH = path.resolve(__dirname, '../README.md');
const SCRIPT_PATH = path.resolve(__dirname, '../src/index.tsx');
const PACKAGE_PATH = path.resolve(__dirname, '../package.json');

const README_FILE = fs.readFileSync(README_PATH, 'utf-8');
const SCRIPT_FILE = fs.readFileSync(SCRIPT_PATH, 'utf-8');
const PACKAGE_NAME = fs.readJSONSync(PACKAGE_PATH).name;

const pipe = (...callbacks) => input =>
  callbacks.reduce((acc, mapper) => mapper(acc), input);

const tag = (target, buildContent) => file => {
  const content =
    typeof buildContent === 'function' ? buildContent() : buildContent;

  const createTag = (target, content) =>
    `<!-- ${target} start -->${content}<!-- ${target} end -->`;

  const regexp = new RegExp(createTag(target, '(.*\\n)*?'));
  const wrappedContent = createTag(target, `\n\n${content}\n\n`);

  return file.replace(regexp, wrappedContent);
};

const JSDOC = {
  clear: pipe(
    str => str.replace('/**', ''),
    str => str.replace('*/', ''),
    str => str.replace(/\n.*?\*/g, '\n'),
    str => str.trim(),
    str => str.split('\n'),
    // lines => lines.map(line => line.trim()),
    lines => lines.join('\n')
  ),

  regexp: '\\/\\*\\*\\s*\\n([^\\*]|(\\*(?!\\/)))*\\*\\/',
};

const MARKDOWN = {
  title: content => `# ${content}`,
  code: (content, lang = '') => `\`\`\`${lang}\n${content}\n\`\`\``,
};

const updateReadme = pipe(
  tag('package-name', MARKDOWN.title(PACKAGE_NAME)),

  tag('installation', () =>
    MARKDOWN.code(
      `# Yarn\nyarn add ${PACKAGE_NAME}\n\n` +
        `# NPM\nnpm install ${PACKAGE_NAME}`,
      'sh'
    )
  ),

  tag('hook-description', () => {
    const regexp = new RegExp(`(${JSDOC.regexp})\\nexport function useCanvas`);
    const [, match] = regexp.exec(SCRIPT_FILE);
    const content = JSDOC.clear(match);

    return content;
  }),

  tag('canvas-options', () => {
    const regexp = /interface CanvasOptions \{(.*\n)*?\}/;
    const [match] = regexp.exec(SCRIPT_FILE);

    const content = MARKDOWN.code(match, 'ts');

    return content;
  }),

  tag('canvas-event', () => {
    const regexp = /interface CanvasEvent \{(.*\n)*?\}/;
    const [match] = regexp.exec(SCRIPT_FILE);
    const content = MARKDOWN.code(match, 'ts');
    return content;
  }),

  tag('canvas-event-description', () => {
    const regexp = new RegExp(
      `(${JSDOC.regexp})\\nexport interface CanvasEvent`
    );
    const [, match] = regexp.exec(SCRIPT_FILE);

    const content = JSDOC.clear(match);
    return content;
  })
);

fs.writeFileSync(README_PATH, updateReadme(README_FILE));
