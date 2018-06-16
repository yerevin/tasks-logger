import React, { Component } from "react";
import "./App.css";
import Sound from "react-sound";
import { CopyToClipboard } from "react-copy-to-clipboard";

let globalTimer = null;
let taskTimer = null;
let secondsElapsed = 0;

const converToHumanReadableFormat = time => {
  let seconds = parseInt(time % 60);
  let minutes = parseInt((time / 60) % 60);
  let hours = parseInt((time / (60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + "h " + minutes + "m " + seconds + "s";
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderSound: false,
      task_url: "",
      tasks: [
        {
          task_url: "http://jira.friendly-solutions.com/browse/RO-820",
          time: "00h 00m",
          timeElapsed: 0,
          isTimerRunning: false,
          description: ""
        }
      ]
    };
  }
  componentDidMount() {
    this.startGlobalWorkTimer();
  }
  addTask = () => {
    this.setState(prevState => ({
      tasks: [
        ...prevState.tasks,
        {
          id: prevState.tasks.length,
          task_url: this.state.task_url,
          time: "0h 00m",
          timeElapsed: 0,
          isTimerRunning: false,
          description: ""
        }
      ]
    }));
  };
  deleteTask = task => {
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(item => item.id !== task.id)
    }));
  };
  startTaskTimer = task => {
    if (this.state.tasks.filter(item => item.isTimerRunning).length > 0) {
      return alert("Stop timer in another task first");
    }
    task.isTimerRunning = true;
    let that = this;
    taskTimer = setInterval(() => {
      secondsElapsed = task.timeElapsed;
      secondsElapsed++;
      task.timeElapsed = secondsElapsed;
      task.time = converToHumanReadableFormat(secondsElapsed);
      that.setState({});
    }, 1000);
    this.setState({});
  };
  stopTaskTimer = task => {
    task.isTimerRunning = false;
    clearInterval(taskTimer);
    secondsElapsed = 0;
    this.setState({});
  };
  startGlobalWorkTimer = () => {
    let that = this;
    globalTimer = setInterval(() => {
      that.setState({ renderSound: true });
    }, 3600000);
  };
  stopMusic = () => {
    this.setState({ renderSound: false });
  };
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="col-md-2" />
            <div className="col-md-8">
              <header>
                <h1>Manage your work in best way</h1>
              </header>
              {this.state.renderSound && (
                <Sound
                  url="standup.mp3"
                  volume={1}
                  playStatus={Sound.status.PLAYING}
                  onPlaying={e => {
                    if (e.position > 60000) {
                      this.setState({
                        renderSound: false
                      });
                    }
                  }}
                />
              )}
              <label>Insert task url</label>
              <div style={{ display: "flex" }}>
                <input
                  placeholder="Insert JIRA task url"
                  className="form-control input-sm"
                  style={{ marginRight: 5 }}
                  onChange={e => this.setState({ task_url: e.target.value })}
                />
                <button
                  className="btn btn-sm btn-success"
                  onClick={this.addTask}
                >
                  Add
                </button>
              </div>
              <h2>Tasks list:</h2>
              <CopyToClipboard text={JSON.stringify(this.state.tasks)}>
                <button className="btn btn-sm" style={{ marginBottom: 10 }}>
                  Copy to clipboard in JSON format
                </button>
              </CopyToClipboard>
              <button
                className="btn btn-sm"
                onClick={this.stopMusic}
                style={{ marginLeft: 5, marginBottom: 10 }}
              >
                Stop music
              </button>
              <ul className="list-group">
                {this.state.tasks.map((item, index) => {
                  return (
                    <li className="list-group-item">
                      <button
                        className="btn btn-sm btn-danger pull-right"
                        onClick={() => this.deleteTask(item)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                      <a href={item.task_url} target="_blank">
                        {item.task_url.split("/").pop()}
                      </a>
                      <p>Time passed: {item.time}</p>
                      <label>Task description</label>
                      <div style={{ display: "flex" }}>
                        <input
                          placeholder="Insert task description"
                          className="form-control input-sm"
                          style={{ marginRight: 5 }}
                          onChange={e => {
                            item.description = e.target.value;
                          }}
                        />
                        <button
                          className={`btn btn-sm btn-${
                            item.isTimerRunning ? "success" : "default"
                          }`}
                          onClick={() =>
                            item.isTimerRunning
                              ? this.stopTaskTimer(item)
                              : this.startTaskTimer(item)
                          }
                        >
                          <i className="fa fa-clock" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="col-md-2" />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
