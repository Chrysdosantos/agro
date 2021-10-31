# Copyright 2021, CSG

from odoo import fields, models

class InheritContactos(models.Model):
	_inherit = 'res.partner'
	_description = 'Herencia al modelo de res.partner'
	
	sucursal = fields.Selection([
		('agroChilapa','Agronutrimentos Especializados'),
		('agroHuitzuco','Agroimpulsora Huitzuco'),
		('agroCosta','Agroimpulsora la Costa')
	])