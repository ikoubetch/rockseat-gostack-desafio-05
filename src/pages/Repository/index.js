/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter, Pagination } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { issueState } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_pag: 30,
          page: 1,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  reloadIssues = async () => {
    this.setState({ loading: true });
    const { match } = this.props;
    const { issueState, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_pag: 30,
        page,
      },
    });

    this.setState({ issues: issues.data, loading: false });
  };

  handleInputChange = e => {
    this.setState({ issueState: e.target.value });
    this.reloadIssues();
  };

  navigatePage = async interval => {
    const { page } = this.state;

    await this.setState({ page: page + interval });
    this.reloadIssues();
  };

  render() {
    const { repository, issues, loading, issueState, page } = this.state;
    if (loading) {
      return <Loading>Carregando...</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <select value={issueState} onChange={this.handleInputChange}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => this.navigatePage(-1)}
          >
            <FaArrowLeft color="#fff" size={16} />
          </button>
          <p>{page}</p>
          <button type="button" onClick={() => this.navigatePage(1)}>
            <FaArrowRight color="#fff" size={16} />
          </button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
