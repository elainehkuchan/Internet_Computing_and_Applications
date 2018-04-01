create database comp5322;

grant all on comp5322.* to comp5322@localhost identified by 'comp5322project' WITH GRANT OPTION;
grant all on comp5322.* to comp5322@'127.0.0.1' identified by 'comp5322project' WITH GRANT OPTION;
flush privileges;

CREATE TABLE IF NOT EXISTS `comp5322`.`users` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `mob_no` varchar(20),
  `user_name` varchar(20) NOT NULL,
  `password` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
);

insert into `comp5322`.`users` values(1, 'Peter', 'Chan', '91239123', 'demo', password('demo'));