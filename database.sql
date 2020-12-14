create database GIS
go
use GIS
go
create table point(
	IDP int primary key,
	long FLOAT(50) not null,
	lat float(50) not null
)
create table polygon (
	IDPO int primary key,
	IDR int foreign key references region(IDR),
	namep varchar(50),
	acreage float
)
create table region(
	IDR int primary key,
	name varchar(50),
)
create table poly_point(
	IDPO int foreign key references polygon(IDPO),
	IDP int foreign key references POINT(IDP),
	primary key (IDPO, IDP)
)
create table epidemic(
	IDE int primary key,
	IDPO int foreign key references polygon(IDPO),
	date smalldatetime,
	confirmed int ,
	deaths int ,
	recovered int,
)
