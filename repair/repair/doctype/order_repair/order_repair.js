// Copyright (c) 2026, Sopwer and contributors
// For license information, please see license.txt

frappe.ui.form.on("Order Repair", {
	refresh(frm, cdt, cdn) {
		addRequestApprovalBtn(frm);
		createSalesInvoiceBtn(frm);
		// 0 = draft
		// 1 = submit
		// 2 = cancelled
		if (frm.doc.docstatus !== 2) {
			const today = frappe.datetime.get_today();
			frappe.model.set_value(cdt, cdn, "service_date", today);
		}
	},
	customer(frm, cdt, cdn) {
		// ambil data customer group dari cutsomer
		frappe.db
			.get_value("Customer", { customer_name: frm.doc.customer }, [
				"customer_type",
				"customer_group",
			])
			.then((res) => {
				const customer_group = res.message.customer_group;
				console.log("🚀 ~ :15 ~ customer_group:", customer_group);
				frappe.model.set_value(cdt, cdn, "customer_group", customer_group);
			});
		// console.log(customer);
	},
	status_order(frm, cdt, cdn) {},
});

frappe.ui.form.on("Order Repair Detail", {
	qty: function (frm, cdt, cdn) {
		const { qty, price } = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "total", qty * price);
	},
	price: function (frm, cdt, cdn) {
		const { qty, price } = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "total", qty * price);
	},
	total: function (frm, cdt, cdn) {
		console.log("total changed");
		calculateGrandTotal(frm, cdt, cdn);
	},
	item_code: function (frm, cdt, cdn) {
		// ambil data dari row yang sedang di edit
		const row = locals[cdt][cdn];
		console.log("item code di pilih", row.item_code);

		frappe.db
			.get_value(
				"Item Price",
				{
					item_code: row.item_code,
					price_list: "Standard Selling",
					selling: 1,
				},
				"price_list_rate",
			)
			.then((response) => {
				console.log("response", response);
				const price = response.message.price_list_rate;
				frappe.model.set_value(cdt, cdn, {
					qty: 1,
					price: price,
					total: price,
				});
			});
	},
});

function calculateGrandTotal(frm, cdt, cdn) {
	const table = frm.doc.items;
	const grand_total = table.reduce((acc, c) => acc + c.total, 0);
	console.log("🚀 ~ :73 ~ calculateGrandTotal ~ grand_total:", grand_total);
	frm.set_value("grand_total", grand_total);
}

function addRequestApprovalBtn(frm) {
	frm.add_custom_button("Request Approval", function () {
		frappe.call({
			method: "repair.repair.doctype.order_repair.order_repair.request_approval",
			args: {
				order_name: frm.doc.name,
			},
			callback: function (r) {
				frappe.msgprint({
					title: __("Notification"),
					indicator: "green",
					message: __("Request Approval telah di buat"),
				});
			},
		});
	}).addClass("btn-info");
}

function createSalesInvoiceBtn(frm) {
	console.log("createSalesInvoiceBtn");
	frm.add_custom_button("Create Sales Invoice", function () {
		frappe.call({
			method: "repair.repair.doctype.order_repair.order_repair.create_sales_invoice",
			args: {
				order_name: frm.doc.name,
			},
			callback: function (r) {
				if (r.message) {
					frappe.set_route("Form", "Sales Invoice", r.message);
				}
			},
		});
	}).addClass("btn-primary");
}
