const yaml = require('js-yaml');

class Configurer {
  static sync(github, repo) {
    return github.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: Configurer.FILE_NAME
    }).then(res => {
      const content = Buffer.from(res.data.content, 'base64').toString();
      return new Configurer(github, repo, content).update();
    });
  }

  constructor(github, repo, config) {
    this.github = github;
    this.repo = repo;
    this.config = yaml.load(config);
  }

  update() {
    return Promise.all(Object.entries(this.config).map(([section, config]) => {
      const debug = {repo: this.repo};
      debug[section] = config;

      const Plugin = Configurer.PLUGINS[section];
      return new Plugin(this.github, this.repo, config).sync();
    }));
  }
}

Configurer.FILE_NAME = '.github/config.yml';

Configurer.PLUGINS = {
  repository: require('./plugins/repository'),
  labels: require('./plugins/labels'),
  collaborators: require('./plugins/collaborators'),
  teams: require('./plugins/teams')
};

module.exports = Configurer;
