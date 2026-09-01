import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import "../Navbar/Navbar.css"
import logo from "../../../assets/new logo1.png";
import ButtonComponent from '../../atoms/ButtonComponent/ButtonComponent';
import { useAuth } from '../../../App';
import { Link, animateScroll as scroll } from 'react-scroll';
import { Link as RouterLink, useLocation } from 'react-router-dom';
const drawerWidth = 240;
// const navItems = ['Home', 'Fish', 'Stones','Plants','Food','Lights','Air Pumps','Tanks & Bowls'];
const navItems = ['Courses',  'Reviews','Clients','Placements','Batches'];


function Navbar(props) {
    let {openModal}=useAuth()
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // On the homepage the nav items smooth-scroll to their in-page section.
  // On any other route (e.g. a course page) that section doesn't exist, so
  // route back to "/" with the section as a hash instead — Home.jsx scrolls
  // to it once it mounts. Keeps every nav item working from every page.
  const navLink = (item) =>
    isHome
      ? <Link to={item} smooth={true} offset={-62} activeClass='active' spy={true}>{item}</Link>
      : <RouterLink to={`/#${item}`}>{item}</RouterLink>;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2,fontFamily:"tilt neon" }}>
        Rest Coder Academy
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding onClick={handleDrawerToggle}>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={navLink(item)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex'}}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>

        <RouterLink to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt=""  />
        </RouterLink>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'block',xs:"block"} }}
          >
            <MenuIcon  sx={{ color: { sm: 'black' ,xs:"black",lg:"white"} }} />
          </IconButton>
        
           
          {/* </Typography> */}
          <Box sx={{ display: { xs: 'none', sm: 'block',marginLeft:"auto" } }}>
            {navItems.map((item) => (
              <ButtonComponent key={item} sx={{ color: '#fff', }} variant='text'>
                  {navLink(item)}
                </ButtonComponent>

            ))}
             <ButtonComponent variant='contained' bgColor='bg-btn-blue' borderRadius='0px' paddingX={1.5} paddingY={.7} onBtnClick={openModal}>
                    Apply Now
                </ButtonComponent>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      
    </Box>
  );
}

Navbar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Navbar;