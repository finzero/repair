from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

# bench execute repair.install.after_migrate
def after_migrate():
    custom_fields = {
        "Sales Invoice": [{
            "fieldname": "order_repair",
            "label": "Order Repair",
            "fieldtype": "Link",
            "options": "Order Repair",
            "insert_after": "customer_name"
        }],
        "Order Repair": [{
            "fieldname": "status_bayar",
            "label": "Status Bayar",
            "fieldtype": "Data",
            "insert_after": "customer_group"
        }]
    }

    create_custom_fields(custom_fields)

# bench execute repair.install.migrate_custom_field_order_repair
def migrate_custom_field_order_repair():
    custom_fields = {
       "Order Repair": [{
            "fieldname": "status_bayar",
            "label": "Status Bayar",
            "fieldtype": "Data",
            "insert_after": "customer_group"
        }]
    }

    create_custom_fields(custom_fields)