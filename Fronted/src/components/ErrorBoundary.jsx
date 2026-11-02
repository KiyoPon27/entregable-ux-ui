import React from 'react';
import styled from 'styled-components';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorContent>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Algo salió mal</ErrorTitle>
            <ErrorMessage>
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </ErrorMessage>
            
            {process.env.NODE_ENV === 'development' && (
              <ErrorDetails>
                <DetailTitle>Detalles (Dev Mode):</DetailTitle>
                <ErrorStackTrace>
                  {this.state.error?.toString()}
                </ErrorStackTrace>
                <ErrorStackTrace>
                  {this.state.errorInfo?.componentStack}
                </ErrorStackTrace>
              </ErrorDetails>
            )}
            
            <ButtonGroup>
              <ResetButton onClick={this.resetError}>
                Intentar nuevamente
              </ResetButton>
              <ReloadButton onClick={() => window.location.reload()}>
                Recargar página
              </ReloadButton>
            </ButtonGroup>
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

const ErrorContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const ErrorContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h1`
  color: #d32f2f;
  font-size: 28px;
  margin: 0 0 12px 0;
`;

const ErrorMessage = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const ErrorDetails = styled.div`
  margin: 20px 0;
  text-align: left;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #d32f2f;
`;

const DetailTitle = styled.h3`
  color: #d32f2f;
  margin: 0 0 8px 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ErrorStackTrace = styled.pre`
  color: #333;
  font-size: 11px;
  margin: 8px 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
`;

const BaseButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled(BaseButton)`
  background: #667eea;
  color: white;

  &:hover {
    background: #5568d3;
  }
`;

const ReloadButton = styled(BaseButton)`
  background: #f5f5f5;
  color: #333;

  &:hover {
    background: #e0e0e0;
  }
`;
