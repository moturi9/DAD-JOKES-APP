import React, { Component } from 'react'
import axios from 'axios'
import Joke from './Joke'
import uuid from 'uuid/v4'
import './JokeList.css'

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }
  constructor(props) {
    super(props)
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false
    }
    this.seenJokes = new Set(this.state.jokes.map(z => z.text))
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.setState({ loading: true }, this.getNewJokes)
  }
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getNewJokes()
  }

  async getNewJokes() {
    try {
      let jokes = []
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get('https://icanhazdadjoke.com/', {
          headers: { Accept: 'application/json' }
        })
        let newJoke = res.data.joke
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuid(), text: newJoke, votes: 0 })
        } else {
          console.log('Found Duplicate Joke')
          console.log(newJoke)
        }
        this.setState(
          st => ({
            jokes: [...st.jokes, ...jokes],
            loading: false
          }),
          () =>
            window.localStorage.setItem(
              'jokes',
              JSON.stringify(this.state.jokes)
            )
        )
      }
    } catch (e) {
      alert(e)
    }
  }

  handleVote(id, delta) {
    this.setState(
      j => ({
        jokes: j.jokes.map(k =>
          k.id === id ? { ...k, votes: k.votes + delta } : k
        )
      }),
      () =>
        window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    )
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">loading....</h1>
        </div>
      )
    }
    let jokesy = this.state.jokes.sort((a, b) => b.votes - a.votes)
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="JokesList_img"
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>

        <div className="JokeList-jokes">
          {jokesy.map(jk => (
            <Joke
              key={jk.id}
              votes={jk.votes}
              text={jk.text}
              upvote={() => this.handleVote(jk.id, 1)}
              downvote={() => this.handleVote(jk.id, -1)}
            />
          ))}
        </div>
      </div>
    )
  }
}
export default JokeList
