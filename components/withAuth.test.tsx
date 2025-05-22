import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import withAuth from './withAuth'; // Path to the HOC
import { useAuth } from '../context/AuthContext'; // Path to the actual hook for type
// Loading component is mocked below

// Mock ../context/AuthContext
jest.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: jest.fn(), 
}));

// Mock next/navigation
const mockRouterReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ // Mock the hook itself
    replace: mockRouterReplace,
  }),
}));

// Mock the Loading component
jest.mock('./LitAuth/Loading', () => ({
    __esModule: true,
    default: ({ copy }: { copy: string}) => <div data-testid="loading-indicator">{copy || 'Loading...'}</div>,
}));


// Dummy Wrapped Component
const MockProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;
const ProtectedPage = withAuth(MockProtectedComponent);

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return value for useAuth
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  // 1. Authenticated User
  it('should render protected content if user is authenticated and not loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    render(<ProtectedPage />);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  // 2. Unauthenticated User
  it('should redirect to /auth if user is not authenticated and not loading', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    render(<ProtectedPage />);

    // The HOC's useEffect for redirection might need a tick for the router.replace to be called
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth');
    });
    // It should show loading while redirecting or null, not the protected content
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  // 3. Loading State (Unauthenticated)
  it('should render loading indicator if isLoading is true and user is unauthenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });

    render(<ProtectedPage />);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    // As per HOC logic, it shows "Authenticating..." when isLoading
    expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Authenticating...');
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  // 4. Authenticated User but Still Loading
  it('should render loading indicator if authenticated but isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      error: null,
    });

    render(<ProtectedPage />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Authenticating...');
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  // Test for transition from loading to authenticated (covered by test 1 after loading)
  // The HOC re-renders based on useAuth updates. If useAuth changes from isLoading=true to isLoading=false & isAuthenticated=true,
  // the behavior is covered by the "Authenticated User" test.
  // A specific test for the *transition* using rerender is complex and might not be necessary
  // if distinct states are tested correctly. The HOC's logic is simple enough that
  // if (isLoading) return <Loading />
  // if (!isAuthenticated) { router.replace(...); return <Loading/> /* or null */ }
  // return <WrappedComponent />
  // covers these states.

  // 5. Error State
  it('should redirect to /auth if not authenticated, even if there is an error', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: new Error('Auth Error'),
    });

    render(<ProtectedPage />);
    
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth');
    });
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('should render protected content if authenticated, even if there is an error', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: new Error('Auth Error but still authenticated'),
    });

    render(<ProtectedPage />);
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
