import React, { useState, useEffect } from 'react';
import './App.css';

import { Auth, Hub } from 'aws-amplify';

import { TextField, Button, Typography, Paper, Container, Grid, CircularProgress, Card} from '@material-ui/core';

import HouseIcon from '@material-ui/icons/House';
import LocalPhoneIcon from '@material-ui/icons/LocalPhone';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import axios from 'axios';

import useStyles from './style';


const initialFormState = {
	username: '', password: '', passwordAgain: '', name: '', email: '', address: '', phone: '', authCode: '', formType: 'signIn'
}

const selectUser = {
	selected: false,  username: ''
}

function App() {

    const [formState, updateFormState] = useState(initialFormState)
	const [currentUser, updateCurrentUser] = useState()
	const [userInfo, updateUserInfo] = useState(null)

	useEffect(() => {
		checkUser()
		setAuthListener()
	}, []);



	const classes = useStyles();

	async function setAuthListener() {
		Hub.listen('auth', (data) => {
			switch (data.payload.event) {
				
				case 'signOut':
					updateFormState(() => ({ ...formState, formType: "signIn" }))
					break;
				
				default:
					break;
			}
		});
	}

	async function checkUser() {
		try {
			const user = await Auth.currentAuthenticatedUser()

			let currentUserName = user.username
			updateCurrentUser(currentUserName)

			updateFormState(() => ({ ...formState, formType: "signedIn" }))

			fetchUserData()

		} catch (err){
			//updateUser(null)
			updateFormState(() => ({ ...formState, formType: "signIn" }))
		}
	}


	const { formType } = formState

	
	const createNewUserData = async() => {
		const { username, email, name, address, phone  } = formState

		const newUserDataInput = {
			"ID": username,
			"name": name,
			"email": email,
			"address": address,
			"phone": phone
		}

		var myHeaders = new Headers();

		myHeaders.append("Content-Type", "application/json");

		var raw = JSON.stringify(newUserDataInput);
		// create a JSON object with parameters for API call and store in a variable
		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow'
		};
		// make API call with parameters and use promises to get response
		fetch("https://3bv0uv3wxi.execute-api.ap-northeast-2.amazonaws.com/dev", requestOptions)
	}

	

	async function fetchUserData() {

		try {
			const response = await axios.get(
				'https://3bv0uv3wxi.execute-api.ap-northeast-2.amazonaws.com/dev/'
			);

			let userDataList = response.data.data.Items;


			updateUserInfo(userDataList);
		
			
			return true;

		} catch (e) {
			console.log(e);
			return TextTrackCueList;
		}
	}


	 

	async function signUp(e) {
		e.preventDefault();

		if (formState.password !== formState.passwordAgain){
            alert('비밀번호가 서로 일치하지 않습니다.');
            return;
        }


		const { username, email, password } = formState
		await Auth.signUp({ username, password, attributes: { email }})
		updateFormState(() => ({ ...formState, formType: "confirmSignUp" }))

		
	}

	
	async function confirmSignUp(e) {
		e.preventDefault();

		const { username, authCode } = formState
		await Auth.confirmSignUp(username, authCode)
		updateFormState(() => ({ ...formState, formType: "signIn" }))

		await createNewUserData()
	}

	async function signIn(e) {
		e.preventDefault();

		const { username, password } = formState
		await Auth.signIn(username, password)
		updateFormState(() => ({ ...formState, formType: "signedIn" }))

		fetchUserData()
	}

	async function goToSignUp(e){
		e.preventDefault();
		updateFormState(() => ({ ...formState, formType: "signUp" }))
	}

    return (
		<Container className="App" maxidth="lg">
			<Grid container alignItems="stretch" spacing={3} justifyContent="center">
			{
				formType === 'signUp' && (
					<Paper className={classes.paper}>
						<form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={signUp}>
							<Typography variant="h6"> Sign Up </Typography>


							<TextField 
								name="username" 
								variant="outlined" 
								label="ID" 
								fullWidth
								value={formState.username}
								onChange={(e) => updateFormState({...formState, username: e.target.value})}
							/>

							<TextField 
								name="password" 
								variant="outlined" 
								label="Password"
								type="password"
								autoComplete="current-password"
								fullWidth
								value={formState.password}
								onChange={(e) => updateFormState({...formState, password: e.target.value})}
							/>


							<TextField 
								name="passwordAgain" 
								variant="outlined" 
								label="Confirm Password" 
								type="password"
								autoComplete="current-password"
								fullWidth
								value={formState.passwordAgain}
								onChange={(e) => updateFormState({...formState, passwordAgain: e.target.value})}
							/>

							<TextField 
								name="name" 
								variant="outlined" 
								label="User Name" 
								fullWidth
								value={formState.name}
								onChange={(e) => updateFormState({...formState, name: e.target.value})}
							/>


							<TextField 
								name="email" 
								variant="outlined" 
								label="Email" 
								fullWidth
								value={formState.email}
								onChange={(e) => updateFormState({...formState, email: e.target.value})}
							/>

							<TextField 
								name="address" 
								variant="outlined" 
								label="Address" 
								fullWidth
								value={formState.address}
								onChange={(e) => updateFormState({...formState, address: e.target.value})}
							/>			

							
							<TextField 
								name="phone" 
								variant="outlined" 
								label="Phone" 
								fullWidth
								value={formState.phone}
								onChange={(e) => updateFormState({...formState, phone: e.target.value})}
							/>						




							<Button 
								className={classes.buttonSubmit} 
								variant="contained" 
								color="primary" 
								size="large" 
								type="submit" 
								fullWidth
							>
								회원가입
							</Button>

							<Button 
								className={`${classes.buttonSubmit} ${classes.loginLink}`} 
								variant="contained" 
								color="secondary" 
								size="small" 
								fullWidth
								onClick={goToSignUp}
							>
								로그인 화면으로
									
							</Button>
						</form>
					</Paper>
				)
			}

			
			{
				formType === 'confirmSignUp' && (
					<Paper className={classes.paper}>
						<form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={confirmSignUp}>
							<Typography variant="h6"> Sign In </Typography>


							<TextField 
								name="authCode" 
								variant="outlined" 
								label="Confirmation code" 
								fullWidth
								value={formState.authCode}
								onChange={(e) => updateFormState({...formState, authCode: e.target.value})}
							/>


							<Button 
								className={classes.buttonSubmit} 
								variant="contained" 
								color="primary" 
								size="large" 
								type="submit" 
								fullWidth
							>
								코드 확인
							</Button>

						</form>
					</Paper>
				)
			}

			{
				formType === 'signIn' && (
					<Paper className={classes.paper}>
						<form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={signIn}>
							<Typography variant="h6"> Sign In </Typography>


							<TextField 
								name="username" 
								variant="outlined" 
								label="ID" 
								fullWidth
								value={formState.username}
								onChange={(e) => updateFormState({...formState, username: e.target.value})}
							/>

							<TextField 
								name="password" 
								variant="outlined" 
								label="Password"
								type="password"
								autoComplete="current-password"
								fullWidth
								value={formState.password}
								onChange={(e) => updateFormState({...formState, password: e.target.value})}
							/>


							<Button 
								className={classes.buttonSubmit} 
								variant="contained" 
								color="primary" 
								size="large" 
								type="submit" 
								fullWidth
							>
								로그인
							</Button>

							<Button 
								className={`${classes.buttonSubmit} ${classes.loginLink}`} 
								variant="contained" 
								color="secondary" 
								size="small" 
								fullWidth
								onClick={goToSignUp}
							>
								회원가입 화면으로
									
							</Button>
						</form>
					</Paper>
				)
			}

			{
				formType === 'signedIn' && (
					<div>
						<h1>
							Hello world, welcome users! 
							<Button onClick={() => Auth.signOut()}> 
								Sign Out
							</Button>
						</h1>
						
						{!userInfo ? <CircularProgress/> : 
							<Grid className={classes.container} container alignItems="stretch" spacing={3}>
								{userInfo.map((userIn, index) => (
									<Grid key={index} item xs={12} sm={12}>
										<Card className={classes.card} >

											<Button size="large" style={{textTransform: 'none'}}>
												<AccountCircleIcon className={classes.icons} fontSize="medium" />
												<Typography variant="h6"> {userIn.ID+" ("+userIn.name+")"}</Typography>
											</Button>

											<Button size="large" style={{textTransform: 'none'}}>
												<MailOutlineIcon className={classes.icons} fontSize="medium" />
												<Typography variant="body1"> {userIn.email}</Typography>
											</Button>

											<Button size="large" style={{textTransform: 'none'}}>
												<LocalPhoneIcon className={classes.icons} fontSize="medium" />
												<Typography variant="body1"> {userIn.phone}</Typography>
											</Button>

											<Button size="large" style={{textTransform: 'none'}}>
												<HouseIcon className={classes.icons} fontSize="medium" />
												<Typography variant="body1"> {userIn.address}</Typography>
													
											</Button>

											

										</Card>
									</Grid>
								))}
							</Grid>
							
						}
						
					</div>
					
				)
			}
			</Grid>
		</Container>
    );
}

export default App;
