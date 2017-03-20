import React from 'react';
import SocketIOClient from 'socket.io-client';
import Player from './Player.jsx';

var socket = SocketIOClient('http://localhost:3000');
const MIN_PLAYERS = 5;

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resultsArray: [],
      questArray: [],
      playerID: '',
      username: this.props.username,
      picker: '',
      voteBoxes: false,
      confirmGroupBtn: false,
      coinCounter: null,
      topMessage: ' ',
      midMessage: ' ',
      roundVoteBtn: null
    };
    socket.on('setPlayerID', (id) => { this.setState({ playerID: id }); socket.emit('updateUsername', ({username: this.props.username, playerID: this.state.playerID})); });  
    socket.on('setPicker', (pickerObj) => { this.setState({ picker: pickerObj.picker }); });
    socket.on('updateQuest', (quests) => { this.setState({ questArray: quests }); });
    socket.on('confirmGroupBtn', (bool) => { this.setState({ confirmGroupBtn: bool }); console.log(this.state.confirmGroupBtn); });
    socket.on('updateCoinCounter', (coin) => { this.setState({ coinCounter: coin }); console.log('coin state ', this.state.coinCounter); });
    socket.on('updateArray', (array) => { this.setState({ resultsArray: array }); console.log('Array Updated To:', this.state.resultsArray); });
    socket.on('voteBoxes', (bool) => { this.setState({ voteBoxes: bool }); console.log('voteBoxes for' + ' ' + this.state.playerID + ' ' + this.state.voteBoxes); });
    socket.on('error', (errorMsg) => { console.log(errorMsg); });
    socket.on('topMessage', (message) => { this.setState({ topMessage: message }); });
    socket.on('midMessage', (message) => { this.setState({ midMessage: message }); });
    socket.on('resetroundVoteBtn', () => { this.setState({ roundVoteBtn: null }); });
    
    
    
    this.roundVote = this.roundVote.bind(this);
    this.isPicker = this.isPicker.bind(this);
    this.sendConfirmation = this.sendConfirmation.bind(this);
  }
  roundVote(voteObj) {
    console.log('in the roundVote on client', voteObj.user + ' ' + voteObj.vote);
    this.setState({
      roundVoteBtn: voteObj.vote
    });
    socket.emit('roundVote', voteObj);
  }

  showID() {
    console.log(this.state.playerID);
  }

  isPicker(picked) {
    console.log('authorized to select? ', this.state.playerID === this.state.picker);
    if (this.state.playerID === this.state.picker) {
      console.log('picker', this.state.picker);
      console.log('picked', picked);
      socket.emit('selectUser', picked);
      console.log(this.state.resultsArray);
    }
  }

  scoreColor(sucess) {
    if (sucess === true) {
      return '#7ED321';
    }
    if (sucess === false) {
      return '#D0011B';
    }
    return 'white';
  }

  sendConfirmation() {
    socket.emit('groupConfirmed');
  }

  buttonColor(val) {
    if (val === 'null') {
      console.log(val);
      this.val = 'open';
    }
  }

  render() {
    if (this.state.resultsArray.length < MIN_PLAYERS) {
      // render waiting area (aka game lobby)
      return (
        <div className='playerList'>
          <p>Hi, {this.state.username}!</p>
          <div className='waitMsg'>Waiting for all players to join . . .</div>
          {this.state.resultsArray.map((player, i) => {
            return <Player selected={player.selected} isPicker={this.isPicker} roundVote={this.roundVote} vote={player.vote} handleCheck={this.handleCheck} key={player.key} userID={player.userID} pickerID={this.state.picker} />;
          })}
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <p>Hi, {this.state.username}</p>

          <div style={{ flex: 1, alignSelf: 'center' }}>
            <button onClick={() => { console.log('starting game'); socket.emit('gameStart'); }}>start game</button>
          </div>

          <div style={{ flex: 1, justifyContent: 'center', alignSelf: 'center' }}>
            <p style={{ textAlign: 'center' }}><b>{this.state.playerID}</b></p>
          </div>

          <div style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>
            <div style={{ fontSize: 20 }}>{this.state.topMessage}</div>
          </div>

          <div style={{ flex: 1, alignSelf: 'center', padding: '8px' }}>
            <div><b>{this.state.midMessage}</b></div>
          </div>

          <div style={{ flex: 1, alignSelf: 'center' }}>
            {this.state.confirmGroupBtn ?
              <div style={{ backgroundColor: '#2196F3', margin: 8, padding: 16, borderRadius: '2px', color: 'white', fontSize: '18px' }} onClick={() => { this.sendConfirmation(); }}>
                {'Start Vote'}
              </div> :
              <div></div>
            }
          </div>

          {this.state.voteBoxes ? <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: this.state.roundVoteBtn ? '#8CE037' : 'white', border: ' 2px solid #8CE037', margin: 8, padding: 16, borderRadius: '3px', color: this.state.roundVoteBtn ? 'white' : '#8CE037', fontSize: '18px' }} onClick={() => { this.roundVote({ user: this.state.playerID, vote: true }); }}>PASS</div>
            <div style={{ backgroundColor: this.state.roundVoteBtn ? 'white' : '#D0011B', border: ' 2px solid #D0011B', margin: 8, padding: 16, borderRadius: '3px', color: this.state.roundVoteBtn ? '#D0011B' : 'white', fontSize: '18px' }} onClick={() => { this.roundVote({ user: this.state.playerID, vote: false }); }}>FAIL</div>

          </div>
            : <p></p>}

          <div style={{ flex: 1, alignSelf: 'center' }}>
            {this.state.resultsArray.map((userInput) => {
              return <Player selected={userInput.selected} isPicker={this.isPicker} roundVote={this.roundVote} vote={userInput.vote} handleCheck={this.handleCheck} key={userInput.key} userID={userInput.userID} pickerID={this.state.picker} />;
            }
            )}

          </div>


          <p style={{ alignSelf: 'center' }} >Vote Round</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
            {
              this.state.questArray.map((quest) => {
                return (
                  <div key={quest.questNum - 1} style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', border: '2px solid #979797', borderRadius: '100%', width: '50px', height: '50px', margin: '5px', backgroundColor: (this.state.coinCounter % this.state.resultsArray.length) === (quest.questNum) ? '#979797' : 'white' }}>
                    <div style={{ fontSize: '25px', color: (this.state.coinCounter % this.state.resultsArray.length) === (quest.questNum) ? 'white' : '#979797', textAlign: 'center', marginTop: '10px' }}>
                      {quest.questNum}
                    </div>
                  </div>
                );
              })
            }
          </div>

          <p style={{ alignSelf: 'center' }} >Score</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>

            {
              this.state.questArray.map((quest) => {
                return (
                  <div key={quest.questNum - 1} style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', border: '2px solid #979797', borderRadius: '100%', width: '50px', height: '50px', margin: '5px', backgroundColor: this.scoreColor(quest.success) }}>
                    <div style={{ fontSize: '25px', color: '#979797', textAlign: 'center', marginTop: '10px' }}>
                      {quest.numberOfPlayers}
                    </div>
                  </div>
                );
              })
            }
          </div>

        </div >
      );
    }
  }
}

export default Game;