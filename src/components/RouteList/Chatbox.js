import React from 'react';
import { PropTypes } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { MessageList } from 'react-chat-elements';
import TextField from 'material-ui/TextField';

// RCE CSS
import 'react-chat-elements/dist/main.css';
import './chatbox-custom.css';

export const ChatboxDialog = ({
  title, open, handleClose, sendMessage, messages
}) => {
  const actions = [
    <FlatButton
      label="Cancelar"
      primary
      keyboardFocused={false}
      onClick={handleClose}
    />,
  ];

  return (<div className="dialog-chooser">
    <Dialog
      title={title}
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={this.handleClose}
    >
      <MessageList
        className="message-list"
        toBottomHeight="100%"
          downButton={true}
        dataSource={messages || []}
      />

    <br />
    <TextField
      onKeyPress={(ev) => {
    if (ev.key === 'Enter') {
        sendMessage(ev);
      ev.preventDefault();
    }
  }}
    />
    </Dialog>
          </div>);
};

ChatboxDialog.propTypes = {
  title: PropTypes.string,
  open: PropTypes.boolean,
  handleClose: PropTypes.func,
  sendMessage: PropTypes.func,
};

ChatboxDialog.defaultProps = {
  title: 'Chat con Usuario Unknown',
  open: false
};
