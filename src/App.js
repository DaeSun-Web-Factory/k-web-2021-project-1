import React, { useState, useEffect } from 'react';
import './App.css';

import { Auth, Hub } from 'aws-amplify';

import { TextField, Button, Typography, Paper, Container, Grid } from '@material-ui/core';

import useStyles from './style';

import {listUsers} from './graphql/queries';
import {createUser} from './graphql/mutations';


const initialFormState = {
	username: '', password: '', passwordAgain: '', name: '', email: '', address: '', phone: '', authCode: '', formType: 'signIn'
}

const selectUser = {
	selected: false,  username: ''
}

function App() {

    const [formState, updateFormState] = useState(initialFormState)
	const [user, updateUser] = useState(null)
	const [selectedInfo, updateSelectedInfo] = useState(selectUser)

	useEffect(() => {
		checkUser()
		setAuthListener()
	}, [])


	const classes = useStyles();

	async function setAuthListener() {
		Hub.listen('auth', (data) => {
			switch (data.payload.event) {
				case 'signIn':
					console.log('user signed in');
					break;
				
				case 'signOut':
					updateFormState(() => ({ ...formState, formType: "signIn" }))
					console.log('user signed out');
					break;
				
				default:
					break;
			}
		});
	}

	async function checkUser() {
		try {
			const user = await Auth.currentAuthenticatedUser()
			updateUser(user)
			updateFormState(() => ({ ...formState, formType: "signedIn" }))

		} catch (err){
			updateUser(null)
			updateFormState(() => ({ ...formState, formType: "signIn" }))
		}
	}

	function onChange(e){
		e.persist()
		updateFormState(() => ({ ...formState, [e.target.name]: e.target.value }))
	}

	const { formType } = formState


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
	}

	async function signIn(e) {
		e.preventDefault();

		const { username, password } = formState
		await Auth.signIn(username, password)
		updateFormState(() => ({ ...formState, formType: "signedIn" }))
	}

	async function goToSignUp(e){
		e.preventDefault();
		updateFormState(() => ({ ...formState, formType: "signUp" }))
	}

    return (
		<Container className="App" maxidth="lg">
			<Grid container alignItems="stretch" spacing={3} justify="center">
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
						<h1>Hello world, welcome user!</h1>
						<button onClick={() => Auth.signOut()}> Sign Out </button>
					</div>
				)
			}
			</Grid>
		</Container>
    );
}

export default App;
