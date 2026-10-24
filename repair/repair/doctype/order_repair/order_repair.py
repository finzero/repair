# Copyright (c) 2026, Sopwer and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from pprint import pprint;

class OrderRepair(Document):
	pass

def before_submit(self):
	order = frappe.db.get_value("Order Repair Approval",
	                            {
									"order_repair_name": self.name
									},
								["order_repair_name","approval_status"], 
								as_dict=True
			);

	if not order:
		frappe.throw(
					title="Error",
					msg=f"Approval {self.name} belum di ajukan"
				)

	if order.get("approval_status") == 'Reject':
		frappe.throw(
			title="Permintaan di tolak",
			msg=f"permintaan approval untuk status {self.name} di tolak"
		)

	if order.get("order_repair_name") == 'New':
		frappe.throw(
					title="Error",
					msg=f"approval untuk order {self.name} belum disetujui"
				)
	pass

@frappe.whitelist()
def request_approval(order_name):
	existing_orr = frappe.db.exists("Order Repair Approval", { "order_repair_name": order_name, "docstatus": ["!=", 2]})
	if existing_orr:
		frappe.throw("Approval Sudah diajukan untuk order {}".format(order_name))

	approval = frappe.new_doc("Order Repair Approval")
	approval.order_repair_name = order_name
	approval.request_approval = "New"
	approval.insert()
	return approval.name

@frappe.whitelist()
def create_sales_invoice(order_name):
	# validasi untuk create sales invoice
	order_repair = frappe.get_doc("Order Repair", order_name)
	if order_repair.status_order != 'Completed' and order_repair.docstatus == 1:
		frappe.throw("Order Repair {} belum Complete".format(order_name))

	sales_invoice = frappe.new_doc("Sales Invoice");
	sales_invoice.customer = order_repair.customer
	sales_invoice.order_repair = order_name
	for item in order_repair.items:
		sales_invoice.append("items", {
			"item_code": item.item_code,
			"item_name": item.item_name,
			"qty": item.qty,
			"price": item.price,
			"total": item.total
		})
	sales_invoice.insert()
	return sales_invoice.name