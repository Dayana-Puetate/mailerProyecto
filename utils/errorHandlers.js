const handleServerError = (res, error) => {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error del servidor' });
  };
  
  const handleNotFoundError = (res, message) => {
    res.status(404).json({ error: message || 'No encontrado' });
  };
  
  module.exports = { handleServerError, handleNotFoundError };
  