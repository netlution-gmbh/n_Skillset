# n_Skillset

Tool to help you and your collegues to manage their skills. Includes a user friendly frontend for your employees and backend options (like an Rest API) to find the right Skillset required for a task.

## 💪 Requirements
- Postgres database
- Entra/ Azure App Registry

### Config Azure Application
To allow your colleagues to login without any problems, we chose to use Azure AD as our authorization backend. Therefore, we need an Azure App Entry

#### App registrations -> Create a new app
* **Supported Account Types:** Accounts in this organizational directory only (MSFT only - Single tenant)
* **Redirect URI**: Your Endpoint, localhost:5173 (optional, for testing purposes)

#### Certificates & Secrets
Create a new client secret for the Mails, you will need the value later.

#### API Permissions
The following Microsoft Graph Permissions are required
* GroupMember.Read.All
* Mail.Send
* User.Read
* offline_access
* openid
* profile

#### App roles
Create an role **Admin** with the value **Role.Admin** and assisgn at least one person to it. Without an admin the application won't work.  

---
Now you should have the following values:

**For MSAL**

`Application (client) ID`  (in the overview)

`Authority URL` (also overview after clicking on Endpoints in the toolbar, first entry)

`Redirect URI` (found in Authentication)

**For Mail**

`Application (client) ID` (in the overview)

`Directory (tenant) ID` (in the overview)

`Mail Secret` (Client secret you created before - Copy Value, not Secret Id)

## 🔧 Installation (with docker)
The software can be setup via Docker using the Dockerfile. Make sure you provide the following environment variables via the `.env`-file.
```
POSTGRES_HOST=your_host
POSTGRES_PORT=your_port
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
```
Once started, n_Skillset tries to connect to the database - if it fails, please check the credentials and the network. On success it will launch the setup screen.

Here you need to follow the wizard and pass several checks to ensure everything can be setup correctly. 




## 🎨 Theming
Since the Skillset uses tailwind, you can easily customize the `tailwind.config.ts` to match your desired colors.
