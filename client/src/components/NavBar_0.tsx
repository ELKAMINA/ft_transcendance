import React from 'react';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home'
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import TelegramIcon from '@mui/icons-material/Telegram';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';

import "./Navbar_0.css";
// import ForumIcon from '@material-ui/icons/Forum';
// import LogoutIcon from '@mui/icons-material/Logout';

interface NavbarProps {
    currentRoute: string;
  }

const Navbar : React.FC<NavbarProps> = ({ currentRoute }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/chat')
    }
    let componentToRender;
    if (currentRoute === '/welcome') {
        componentToRender = (
        <>
        <div className='navbar__header__middle'>
            <div className="navbar__header__options navbar__header__options--active">
                <HomeIcon fontSize="large"/>
            </div>
            <div className="navbar__header__options">
                <PersonAddIcon fontSize="large"/>
            </div>
            <img src="" alt=""/>
            <div className = 'navbar__header__input'>
                <TelegramIcon onClick={handleClick}/>
            </div>
        </div>

    {/* ********************************** */}
        <div className="navbar__header__right">
            <Avatar />
            <h4> Alina </h4>
            <IconButton>
                <LogoutIcon fontSize='large' />
            </IconButton>  
        </div>
    </>
)
    }
    else {
        componentToRender = (
            <>
                <div className="navbar__header__right__options">
                    <Avatar />
                    <h4> Username </h4>
                    <IconButton>
                        <LogoutIcon fontSize='large' />
                    </IconButton>  
                </div>
            </>
        )
    }
    return <div className='navbar'> { componentToRender} </div>
}

export default Navbar;