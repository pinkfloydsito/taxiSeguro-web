import React from 'react';
import { PropTypes } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

export const UserChooserDialog = ({ title, open, handleClose, handleClientChat, handleDriverChat }) => {
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
      onRequestClose={handleClose}
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
          <IconButton onClick={handleClientChat}>
              <FontIcon className="material-icons">person pin</FontIcon>
            </IconButton>
          </div>
          <div className="col-md-6">
            <IconButton onClick={handleDriverChat}>
              <FontIcon className="material-icons">directions bus</FontIcon>
            </IconButton>
          </div>
        </div>
      </div>
    </Dialog>
          </div>);
};

UserChooserDialog.propTypes = {
    title: PropTypes.string,
    open: PropTypes.Boolean,
  handleClose: PropTypes.func.required,
    handleClientChat: PropTypes.func.required,
  handleDriverChat: PropTypes.func.required
};

UserChooserDialog.defaultProps = {
  title: 'SELECCIONE EL USUARIO',
    open: false,
};
