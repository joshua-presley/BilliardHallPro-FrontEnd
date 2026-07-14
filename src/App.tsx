import { Route, Routes } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import ProtectedRoute from './components/ProtectedRoute';
import OverviewScreen from './pages/OverviewScreen';

function App() {

 


  return (
    <Routes>
      <Route path='/login' element={<LoginScreen/>}/>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<OverviewScreen />}>
          {/* <Route index element={<Dashboard />} />
          <Route path="tables" element={<TableList />} />
          <Route path="tables/:id" element={<TableDetail />} />
          <Route path="schedules" element={<ScheduleList />} />
          <Route path="schedules/:id" element={<ScheduleDetail />} />
          <Route path="sessions" element={<SessionList />} />
          <Route path="players" element={<PlayerList />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;