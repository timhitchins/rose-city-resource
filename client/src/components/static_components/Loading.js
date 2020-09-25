import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const styles = {
  content: {
    texAlign: 'center',
    fontSize: '20px',
    marginLeft: '10px',
    color: '#2E3238'
  }
};

//this component was updated to include
//the babel transform class properties
class Loading extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired
  };

  //this is where we add default props
  static defaultProps = {
    text: 'Loading',
    speed: 300
  };

  state = {
    //old way
    //text: props.text
    //new
    text: this.props.text
  };

  componentDidMount() {
    const { text, speed } = this.props;
    const stopper = text + '...';

    this.interval = window.setInterval(() => {
      this.state.text === stopper
        ? this.setState(() => ({ text: this.props.text }))
        : this.setState(prevState => ({ text: prevState.text + '.' }));
    }, speed);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  render() {
    return (
      <div className="loading-container">
        <FontAwesomeIcon
          style={{ color: '#2E3238' }}
          icon="spinner"
          size="lg"
          pulse
        />
        <p style={styles.content}>{this.state.text}</p>
      </div>
    );
  }
}

export default Loading;
