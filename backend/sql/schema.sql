-- UrbanFlow MSSQL auth-only schema
-- Create DB first if needed:
-- CREATE DATABASE UrbanFlow;
-- GO
-- USE UrbanFlow;
-- GO

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(120) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL
);
GO

CREATE INDEX IX_Users_Email ON dbo.Users(email);
GO
