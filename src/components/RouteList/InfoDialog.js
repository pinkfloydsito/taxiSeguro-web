import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export const InfoDialog = ({
  open, handleClose
}) => {
  const actions = [
    <FlatButton
      label="Cerrar"
      primary
      keyboardFocused={false}
      onClick={handleClose}
    />,
  ];

  return (<div className="dialog-chooser">
    <Dialog
      title="No se puede enviar mensaje"
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={this.handleClose}
    >
          No se pudo enviar el mensaje
    </Dialog>
          </div>);
};
