import React, { Component } from "react";
import "./App.css";
import Sound from "react-sound";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  converToHumanReadableFormat,
  converToHumanReadableFormatWithoutSeconds,
  getTasksSummary,
  calcMinToSec
} from "./logic";

let globalTimer = null;
let taskTimer = null;
let secondsElapsed = 0;

const getProgressBarStatus = context => {
  return ((context.state.breakTimerSecondsElapsed / (context.state.musicLoopTime / 1000)) * 100).toFixed(0);
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderSound: false,
      task_url: "",
      timeToManipulate: 0,
      breakTimerSecondsElapsed: 0,
      refreshTasks: true,
      musicVolume: parseInt(localStorage.getItem("musicVolume")) || 100,
      musicLoopTime: parseInt(localStorage.getItem("musicLoopTime")) || 3600000,
      tasks:
        JSON.parse(localStorage.getItem("tasks")) && JSON.parse(localStorage.getItem("tasks")).length !== 0
          ? JSON.parse(localStorage.getItem("tasks")).map(item => {
              item.isTimerRunning = false;
              return item;
            })
          : []
    };
  }
  componentDidMount() {
    this.startGlobalWorkTimer();
  }
  addTask = () => {
    if (this.state.task_url.length === 0) {
      return alert("Insert link to JIRA issue first.");
    }
    this.setState(prevState => ({
      tasks: [
        ...prevState.tasks,
        {
          id: prevState.tasks.length,
          task_url: this.state.task_url,
          time: "0h 00m",
          wasLogged: false,
          timeElapsed: 0,
          isTimerRunning: false,
          description: ""
        }
      ]
    }));
  };
  deleteTask = task => {
    const confirmed = window.confirm(`Are you sure to delete task?`);
    if (confirmed) {
      this.setState(prevState => ({
        tasks: prevState.tasks.filter(item => item.id !== task.id)
      }));
    }
  };
  deleteTasks = () => {
    const confirmed = window.confirm(`Are you sure to delete all tasks?`);
    if (confirmed) {
      this.setState(prevState => ({
        tasks: []
      }));
    }
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
    setInterval(() => {
      that.setState(prevState => ({
        breakTimerSecondsElapsed: ++prevState.breakTimerSecondsElapsed
      }));
      localStorage.setItem("tasks", JSON.stringify(that.state.tasks));
    }, 1000);
    globalTimer = setInterval(() => {
      that.setState({ breakTimerSecondsElapsed: 0 });
      that.setState({ renderSound: true });
    }, that.state.musicLoopTime || 3600000);
  };
  changeGlobalMusicTimerLoopTime = time => {
    clearInterval(globalTimer);
    localStorage.setItem("musicLoopTime", parseInt(time));
    this.setState({ musicLoopTime: time });
    this.startGlobalWorkTimer();
  };
  stopMusic = () => {
    this.setState({ renderSound: false });
  };
  changeTaskLoggedStatus = task => {
    task.wasLogged = !task.wasLogged;
    this.setState({});
  };
  getElapsedTimeSummary = () => {
    let timeSummary = 0;
    this.state.tasks.forEach(item => (timeSummary += item.timeElapsed));
    return converToHumanReadableFormat(timeSummary);
  };
  refreshTasks = () => {
    this.setState({ refreshTasks: false });
    setTimeout(() => {
      this.setState({ refreshTasks: true });
    }, 1);
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
                  url="https://drive.google.com/uc?export=download&id=19amH_gU4GW0LXEtwIz8iVUJ_6e605oPv"
                  volume={this.state.musicVolume ? this.state.musicVolume : 100}
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
                <button className="btn btn-sm btn-success" onClick={this.addTask}>
                  Add
                </button>
              </div>
              <h3>General:</h3>
              <div style={{ display: "flex" }}>
                <h4>Time left to next break: {converToHumanReadableFormat(this.state.breakTimerSecondsElapsed)}</h4>
                <div style={{ width: "100%", marginTop: 10 }} className="progress">
                  <div
                    className="progress-bar"
                    aria-valuenow={getProgressBarStatus(this)}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: `${getProgressBarStatus(this)}%` }}
                  >
                    <span>{getProgressBarStatus(this)}% elapsed</span>
                  </div>
                </div>
              </div>
              <label>Break music loop time (in minutes)</label>
              <input
                placeholder="Insert music loop time"
                className="form-control input-sm"
                defaultValue={parseInt(this.state.musicLoopTime / 1000 / 60)}
                onChange={e => {
                  this.changeGlobalMusicTimerLoopTime(parseInt(e.target.value * 60 * 1000));
                }}
              />
              <label>Break music volume</label>
              <div style={{ display: "flex" }}>
                <input
                  placeholder="Insert music volume"
                  className="form-control input-sm"
                  defaultValue={this.state.musicVolume}
                  style={{ marginRight: 5 }}
                  onChange={e => {
                    this.setState({ musicVolume: parseInt(e.target.value) });
                    localStorage.setItem("musicVolume", parseInt(e.target.value));
                  }}
                />
                <button className="btn btn-sm" onClick={this.stopMusic} style={{ marginLeft: 5, marginBottom: 10 }}>
                  Stop music
                </button>
              </div>
              <h2>Tasks list: (today time elapsed {this.getElapsedTimeSummary()})</h2>
              <CopyToClipboard text={getTasksSummary(this.state.tasks)}>
                <button className="btn btn-sm" style={{ marginBottom: 10 }}>
                  Copy to clipboard in JSON format
                </button>
              </CopyToClipboard>
              <button
                className="btn btn-sm btn-danger"
                onClick={this.deleteTasks}
                style={{ marginLeft: 5, marginBottom: 10 }}
              >
                Clear all tasks
              </button>
              <ul className="list-group">
                {this.state.refreshTasks &&
                  this.state.tasks.length !== 0 &&
                  this.state.tasks.map((item, index) => {
                    return (
                      <li className="list-group-item dark-bg">
                        <button className="btn btn-sm btn-danger pull-right" onClick={() => this.deleteTask(item)}>
                          <i className="fa fa-trash" />
                        </button>
                        <button
                          className={`btn btn-sm btn-${item.isTimerRunning ? "success" : "default"} pull-right`}
                          style={{ marginRight: 5 }}
                          onClick={() => (item.isTimerRunning ? this.stopTaskTimer(item) : this.startTaskTimer(item))}
                        >
                          <i className="fa fa-clock" />
                        </button>
                        <button
                          style={{ marginRight: 5 }}
                          className={`btn btn-sm btn-${item.wasLogged ? "primary" : "default"} pull-right`}
                          onClick={() => this.changeTaskLoggedStatus(item)}
                          title="Was logged?"
                        >
                          <i className="fa fa-plus" />
                        </button>
                        <a href={item.task_url} target="_blank">
                          {item.task_url.split("/").pop()}
                        </a>
                        <input
                          placeholder="Task url"
                          className="form-control input-sm"
                          defaultValue={item.task_url}
                          style={{ marginRight: 5, width: "70%" }}
                          onChange={e => {
                            item.task_url = e.target.value;
                            this.setState({});
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            marginTop: 5,
                            marginBottom: 5
                          }}
                        >
                          <div className="col-md-2">
                            <p>Time passed: {converToHumanReadableFormat(item.timeElapsed)}</p>
                          </div>
                          <div
                            className="col-md-10"
                            style={{
                              display: "flex",
                              marginTop: 5,
                              marginBottom: 5
                            }}
                          >
                            <input
                              placeholder="Insert time to manipulate (in minutes)"
                              className="form-control input-sm"
                              defaultValue={this.state.timeToManipulate}
                              style={{ marginLeft: 5, width: "30%" }}
                              onChange={e => {
                                this.setState({
                                  timeToManipulate: e.target.value
                                });
                              }}
                            />
                            <button
                              className={`btn btn-sm btn-success`}
                              style={{
                                marginLeft: 5,
                                marginBottom: 10
                              }}
                              onClick={() => {
                                item.timeElapsed = item.timeElapsed + calcMinToSec(this.state.timeToManipulate);
                                this.setState({});
                              }}
                            >
                              <i className="fa fa-plus" />
                            </button>
                            <button
                              className={`btn btn-sm btn-danger`}
                              style={{
                                marginLeft: 5,
                                marginBottom: 10
                              }}
                              onClick={() => {
                                item.timeElapsed = item.timeElapsed - calcMinToSec(this.state.timeToManipulate);
                                this.setState({});
                              }}
                            >
                              <i className="fa fa-minus" />
                            </button>
                          </div>
                        </div>

                        <label>Task description</label>
                        <div style={{ display: "flex" }}>
                          <textarea
                            placeholder="Insert task description"
                            className="form-control input-sm"
                            defaultValue={item.description}
                            style={{ marginRight: 5 }}
                            onChange={e => {
                              item.description = e.target.value;
                              this.setState({});
                            }}
                          />
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
