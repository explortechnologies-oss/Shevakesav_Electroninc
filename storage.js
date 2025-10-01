var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { users, customers, technicians, productTypes, brands, models, jobSheets, inventory, payments, invoices, invoiceParts, dInvoices, dInvoiceParts, quotations, quotationParts } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, and, gte, lte, sql } from "drizzle-orm";
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.id, parseInt(id)))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.username, username))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(users).values(insertUser).returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCustomers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(customers).orderBy(desc(customers.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCustomer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var customer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(customers).where(eq(customers.id, parseInt(id)))];
                    case 1:
                        customer = (_a.sent())[0];
                        return [2 /*return*/, customer || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createCustomer = function (customer) {
        return __awaiter(this, void 0, void 0, function () {
            var newCustomer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(customers).values(customer).returning()];
                    case 1:
                        newCustomer = (_a.sent())[0];
                        return [2 /*return*/, newCustomer];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateCustomer = function (id, customer) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedCustomer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(customers)
                            .set(customer)
                            .where(eq(customers.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedCustomer = (_a.sent())[0];
                        return [2 /*return*/, updatedCustomer];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteCustomer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(customers).where(eq(customers.id, parseInt(id)))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTechnicians = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(technicians).orderBy(desc(technicians.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTechnician = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var technician;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(technicians).where(eq(technicians.id, parseInt(id)))];
                    case 1:
                        technician = (_a.sent())[0];
                        return [2 /*return*/, technician || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTechnician = function (technician) {
        return __awaiter(this, void 0, void 0, function () {
            var newTechnician;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(technicians).values(technician).returning()];
                    case 1:
                        newTechnician = (_a.sent())[0];
                        return [2 /*return*/, newTechnician];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTechnician = function (id, technician) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedTechnician;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(technicians)
                            .set(technician)
                            .where(eq(technicians.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedTechnician = (_a.sent())[0];
                        return [2 /*return*/, updatedTechnician];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteTechnician = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(technicians).where(eq(technicians.id, parseInt(id)))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProductTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(productTypes)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getBrands = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(brands).orderBy(brands.displayName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getModelsByBrand = function (brandId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(models).where(eq(models.brandId, parseInt(brandId)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createProductType = function (productType) {
        return __awaiter(this, void 0, void 0, function () {
            var newProductType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(productTypes).values(productType).returning()];
                    case 1:
                        newProductType = (_a.sent())[0];
                        return [2 /*return*/, newProductType];
                }
            });
        });
    };
    DatabaseStorage.prototype.createBrand = function (brand) {
        return __awaiter(this, void 0, void 0, function () {
            var newBrand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(brands).values(brand).returning()];
                    case 1:
                        newBrand = (_a.sent())[0];
                        return [2 /*return*/, newBrand];
                }
            });
        });
    };
    DatabaseStorage.prototype.createModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var newModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(models).values(model).returning()];
                    case 1:
                        newModel = (_a.sent())[0];
                        return [2 /*return*/, newModel];
                }
            });
        });
    };
    DatabaseStorage.prototype.getJobSheets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            id: jobSheets.id,
                            jobId: jobSheets.jobId,
                            status: jobSheets.status,
                            jobType: jobSheets.jobType,
                            jobClassification: jobSheets.jobClassification,
                            jobMode: jobSheets.jobMode,
                            warrantyStatus: jobSheets.warrantyStatus,
                            productType: jobSheets.productType,
                            brand: jobSheets.brand,
                            model: jobSheets.model,
                            modelNumber: jobSheets.modelNumber,
                            serialNumber: jobSheets.serialNumber,
                            purchaseDate: jobSheets.purchaseDate,
                            customerComplaint: jobSheets.customerComplaint,
                            reportedIssue: jobSheets.reportedIssue,
                            agentRemarks: jobSheets.agentRemarks,
                            accessoriesReceived: jobSheets.accessoriesReceived,
                            jobStartDateTime: jobSheets.jobStartDateTime,
                            createdAt: jobSheets.createdAt,
                            customer: {
                                id: customers.id,
                                name: customers.name,
                                phone: customers.phone,
                                alternatePhone: customers.alternatePhone,
                                address: customers.address,
                                city: customers.city,
                                state: customers.state,
                                pinCode: customers.pinCode,
                            },
                            technician: {
                                id: technicians.id,
                                name: technicians.name,
                            },
                            productTypeRef: {
                                id: productTypes.id,
                                displayName: productTypes.displayName,
                            },
                            brandRef: {
                                id: brands.id,
                                displayName: brands.displayName,
                            },
                            modelRef: {
                                id: models.id,
                                displayName: models.displayName,
                            },
                        })
                            .from(jobSheets)
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .orderBy(desc(jobSheets.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getJobSheet = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var jobSheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            id: jobSheets.id,
                            jobId: jobSheets.jobId,
                            status: jobSheets.status,
                            jobType: jobSheets.jobType,
                            jobClassification: jobSheets.jobClassification,
                            jobMode: jobSheets.jobMode,
                            warrantyStatus: jobSheets.warrantyStatus,
                            productType: jobSheets.productType,
                            brand: jobSheets.brand,
                            model: jobSheets.model,
                            modelNumber: jobSheets.modelNumber,
                            serialNumber: jobSheets.serialNumber,
                            purchaseDate: jobSheets.purchaseDate,
                            customerComplaint: jobSheets.customerComplaint,
                            reportedIssue: jobSheets.reportedIssue,
                            agentRemarks: jobSheets.agentRemarks,
                            jobStartDateTime: jobSheets.jobStartDateTime,
                            createdAt: jobSheets.createdAt,
                            customer: customers,
                            technician: technicians,
                            productTypeRef: productTypes,
                            brandRef: brands,
                            modelRef: models,
                            agent: {
                                id: users.id,
                                name: users.name,
                            },
                        })
                            .from(jobSheets)
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .leftJoin(users, eq(jobSheets.agentId, users.id))
                            .where(eq(jobSheets.id, parseInt(id)))];
                    case 1:
                        jobSheet = (_a.sent())[0];
                        return [2 /*return*/, jobSheet || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createJobSheet = function (jobSheet) {
        return __awaiter(this, void 0, void 0, function () {
            var newJobSheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(jobSheets).values(jobSheet).returning()];
                    case 1:
                        newJobSheet = (_a.sent())[0];
                        return [2 /*return*/, newJobSheet];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateJobSheet = function (id, jobSheet) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedJobSheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(jobSheets)
                            .set(__assign(__assign({}, jobSheet), { updatedAt: new Date() }))
                            .where(eq(jobSheets.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedJobSheet = (_a.sent())[0];
                        return [2 /*return*/, updatedJobSheet];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteJobSheet = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(jobSheets).where(eq(jobSheets.id, parseInt(id)))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.generateJobId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var year, nextNumber, jobId, exists, existingJob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        year = new Date().getFullYear();
                        nextNumber = 1;
                        exists = true;
                        _a.label = 1;
                    case 1:
                        if (!exists) return [3 /*break*/, 3];
                        jobId = "JS-".concat(year, "-").concat(nextNumber.toString().padStart(3, '0'));
                        return [4 /*yield*/, db
                                .select({ id: jobSheets.id })
                                .from(jobSheets)
                                .where(eq(jobSheets.jobId, jobId))];
                    case 2:
                        existingJob = (_a.sent())[0];
                        if (!existingJob) {
                            exists = false;
                        }
                        else {
                            nextNumber++;
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, jobId];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventoryItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(inventory).orderBy(inventory.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventoryItem = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(inventory).where(eq(inventory.id, parseInt(id)))];
                    case 1:
                        item = (_a.sent())[0];
                        return [2 /*return*/, item || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInventoryItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(inventory).values(item).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateInventoryItem = function (id, item) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(inventory)
                            .set(item)
                            .where(eq(inventory.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedItem = (_a.sent())[0];
                        return [2 /*return*/, updatedItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPayments = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(payments).orderBy(desc(payments.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPaymentsByJobSheet = function (jobSheetId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(payments).where(eq(payments.jobSheetId, parseInt(jobSheetId)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createPayment = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            var newPayment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(payments).values(payment).returning()];
                    case 1:
                        newPayment = (_a.sent())[0];
                        return [2 /*return*/, newPayment];
                }
            });
        });
    };
    DatabaseStorage.prototype.getDashboardMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfDay, endOfDay, activeJobs, completedToday, pendingJobs, todayRevenue, totalCollected, totalDue, availableStock, lowStock, outOfStock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(jobSheets)
                                .where(eq(jobSheets.status, 'in_progress'))];
                    case 1:
                        activeJobs = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(jobSheets)
                                .where(and(eq(jobSheets.status, 'completed'), gte(jobSheets.updatedAt, startOfDay), lte(jobSheets.updatedAt, endOfDay)))];
                    case 2:
                        completedToday = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(jobSheets)
                                .where(eq(jobSheets.status, 'pending'))];
                    case 3:
                        pendingJobs = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ total: sum(payments.internalAmount) })
                                .from(payments)
                                .where(and(gte(payments.createdAt, startOfDay), lte(payments.createdAt, endOfDay)))];
                    case 4:
                        todayRevenue = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ total: sum(payments.internalAmount) })
                                .from(payments)
                                .where(eq(payments.status, 'paid'))];
                    case 5:
                        totalCollected = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ total: sum(payments.balance) })
                                .from(payments)
                                .where(eq(payments.status, 'pending'))];
                    case 6:
                        totalDue = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(inventory)
                                .where(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["quantity > min_quantity"], ["quantity > min_quantity"]))))];
                    case 7:
                        availableStock = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(inventory)
                                .where(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["quantity <= min_quantity AND quantity > 0"], ["quantity <= min_quantity AND quantity > 0"]))))];
                    case 8:
                        lowStock = (_a.sent())[0];
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(inventory)
                                .where(eq(inventory.quantity, 0))];
                    case 9:
                        outOfStock = (_a.sent())[0];
                        return [2 /*return*/, {
                                activeJobs: (activeJobs === null || activeJobs === void 0 ? void 0 : activeJobs.count) || 0,
                                completedToday: (completedToday === null || completedToday === void 0 ? void 0 : completedToday.count) || 0,
                                pendingJobs: (pendingJobs === null || pendingJobs === void 0 ? void 0 : pendingJobs.count) || 0,
                                todayRevenue: (todayRevenue === null || todayRevenue === void 0 ? void 0 : todayRevenue.total) || 0,
                                totalCollected: (totalCollected === null || totalCollected === void 0 ? void 0 : totalCollected.total) || 0,
                                totalDue: (totalDue === null || totalDue === void 0 ? void 0 : totalDue.total) || 0,
                                availableStock: (availableStock === null || availableStock === void 0 ? void 0 : availableStock.count) || 0,
                                lowStock: (lowStock === null || lowStock === void 0 ? void 0 : lowStock.count) || 0,
                                outOfStock: (outOfStock === null || outOfStock === void 0 ? void 0 : outOfStock.count) || 0,
                            }];
                }
            });
        });
    };
    // Invoice methods
    DatabaseStorage.prototype.getInvoices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var invoicesList, invoicesWithParts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            invoice: invoices,
                            jobSheet: jobSheets,
                            customer: customers,
                            productType: productTypes,
                            brand: brands,
                            model: models,
                            technician: technicians,
                        })
                            .from(invoices)
                            .leftJoin(jobSheets, eq(invoices.jobSheetId, jobSheets.id))
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .orderBy(desc(invoices.createdAt))];
                    case 1:
                        invoicesList = _a.sent();
                        return [4 /*yield*/, Promise.all(invoicesList.map(function (invoice) { return __awaiter(_this, void 0, void 0, function () {
                                var parts;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, db
                                                .select()
                                                .from(invoiceParts)
                                                .where(eq(invoiceParts.invoiceId, invoice.invoice.id))];
                                        case 1:
                                            parts = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, invoice), { parts: parts })];
                                    }
                                });
                            }); }))];
                    case 2:
                        invoicesWithParts = _a.sent();
                        return [2 /*return*/, invoicesWithParts];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInvoiceById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var invoice, parts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            invoice: invoices,
                            jobSheet: jobSheets,
                            customer: customers,
                            productType: productTypes,
                            brand: brands,
                            model: models,
                            technician: technicians,
                        })
                            .from(invoices)
                            .leftJoin(jobSheets, eq(invoices.jobSheetId, jobSheets.id))
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .where(eq(invoices.id, parseInt(id)))];
                    case 1:
                        invoice = (_a.sent())[0];
                        if (!invoice)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(invoiceParts)
                                .where(eq(invoiceParts.invoiceId, parseInt(id)))];
                    case 2:
                        parts = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, invoice), { parts: parts })];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInvoice = function (invoice_1) {
        return __awaiter(this, arguments, void 0, function (invoice, parts) {
            var year, result, nextNumber, invoiceNumber, newInvoice, partsData;
            if (parts === void 0) { parts = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        year = new Date().getFullYear();
                        return [4 /*yield*/, db
                                .select({ count: count() })
                                .from(invoices)
                                .where(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["EXTRACT(YEAR FROM created_at) = ", ""], ["EXTRACT(YEAR FROM created_at) = ", ""])), year))];
                    case 1:
                        result = (_a.sent())[0];
                        nextNumber = ((result === null || result === void 0 ? void 0 : result.count) || 0) + 1;
                        invoiceNumber = "INV-".concat(year, "-").concat(nextNumber.toString().padStart(4, '0'));
                        return [4 /*yield*/, db
                                .insert(invoices)
                                .values(__assign(__assign({}, invoice), { invoiceNumber: invoiceNumber }))
                                .returning()];
                    case 2:
                        newInvoice = (_a.sent())[0];
                        if (!(parts && parts.length > 0)) return [3 /*break*/, 4];
                        partsData = parts.map(function (part) { return ({
                            invoiceId: newInvoice.id,
                            partName: part.name,
                            quantity: part.quantity,
                            unitPrice: part.rate.toString(),
                            amount: part.amount.toString(),
                        }); });
                        return [4 /*yield*/, db.insert(invoiceParts).values(partsData)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, newInvoice];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateInvoice = function (id, invoice) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(invoices)
                            .set(invoice)
                            .where(eq(invoices.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedInvoice = (_a.sent())[0];
                        return [2 /*return*/, updatedInvoice];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteInvoice = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Delete invoice parts first
                    return [4 /*yield*/, db.delete(invoiceParts).where(eq(invoiceParts.invoiceId, parseInt(id)))];
                    case 1:
                        // Delete invoice parts first
                        _a.sent();
                        // Delete invoice
                        return [4 /*yield*/, db.delete(invoices).where(eq(invoices.id, parseInt(id)))];
                    case 2:
                        // Delete invoice
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // D-Invoice methods
    DatabaseStorage.prototype.getDInvoices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dInvoicesList, dInvoicesWithParts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            invoice: dInvoices,
                            jobSheet: jobSheets,
                            customer: customers,
                            productType: productTypes,
                            brand: brands,
                            model: models,
                            technician: technicians,
                        })
                            .from(dInvoices)
                            .leftJoin(jobSheets, eq(dInvoices.jobSheetId, jobSheets.id))
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .orderBy(desc(dInvoices.createdAt))];
                    case 1:
                        dInvoicesList = _a.sent();
                        return [4 /*yield*/, Promise.all(dInvoicesList.map(function (dInvoiceItem) { return __awaiter(_this, void 0, void 0, function () {
                                var parts;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, db
                                                .select()
                                                .from(dInvoiceParts)
                                                .where(eq(dInvoiceParts.invoiceId, dInvoiceItem.invoice.id))];
                                        case 1:
                                            parts = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, dInvoiceItem), { parts: parts })];
                                    }
                                });
                            }); }))];
                    case 2:
                        dInvoicesWithParts = _a.sent();
                        return [2 /*return*/, dInvoicesWithParts];
                }
            });
        });
    };
    DatabaseStorage.prototype.getDInvoiceById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var dInvoiceItem, parts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            invoice: dInvoices,
                            jobSheet: jobSheets,
                            customer: customers,
                            productType: productTypes,
                            brand: brands,
                            model: models,
                            technician: technicians,
                        })
                            .from(dInvoices)
                            .leftJoin(jobSheets, eq(dInvoices.jobSheetId, jobSheets.id))
                            .leftJoin(customers, eq(jobSheets.customerId, customers.id))
                            .leftJoin(productTypes, eq(jobSheets.productTypeId, productTypes.id))
                            .leftJoin(brands, eq(jobSheets.brandId, brands.id))
                            .leftJoin(models, eq(jobSheets.modelId, models.id))
                            .leftJoin(technicians, eq(jobSheets.technicianId, technicians.id))
                            .where(eq(dInvoices.id, parseInt(id)))];
                    case 1:
                        dInvoiceItem = (_a.sent())[0];
                        if (!dInvoiceItem)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(dInvoiceParts)
                                .where(eq(dInvoiceParts.invoiceId, dInvoiceItem.invoice.id))];
                    case 2:
                        parts = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, dInvoiceItem), { parts: parts })];
                }
            });
        });
    };
    DatabaseStorage.prototype.createDInvoice = function (dInvoiceData, parts) {
        return __awaiter(this, void 0, void 0, function () {
            var dInvoiceNumber, newDInvoice, partsData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateDInvoiceNumber()];
                    case 1:
                        dInvoiceNumber = _a.sent();
                        return [4 /*yield*/, db.insert(dInvoices).values(__assign(__assign({}, dInvoiceData), { invoiceNumber: dInvoiceNumber })).returning()];
                    case 2:
                        newDInvoice = (_a.sent())[0];
                        if (!(parts && parts.length > 0)) return [3 /*break*/, 4];
                        partsData = parts.map(function (part) { return ({
                            invoiceId: newDInvoice.id,
                            partName: part.partName || part.name,
                            quantity: part.quantity,
                            unitPrice: (part.unitPrice || part.rate || 0).toString(),
                            amount: (part.amount || 0).toString(),
                        }); });
                        return [4 /*yield*/, db.insert(dInvoiceParts).values(partsData)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, newDInvoice];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateDInvoice = function (id, dInvoiceData) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedDInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(dInvoices)
                            .set(dInvoiceData)
                            .where(eq(dInvoices.id, parseInt(id)))
                            .returning()];
                    case 1:
                        updatedDInvoice = (_a.sent())[0];
                        return [2 /*return*/, updatedDInvoice];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteDInvoice = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Delete D-invoice parts first
                    return [4 /*yield*/, db.delete(dInvoiceParts).where(eq(dInvoiceParts.invoiceId, parseInt(id)))];
                    case 1:
                        // Delete D-invoice parts first
                        _a.sent();
                        // Delete D-invoice
                        return [4 /*yield*/, db.delete(dInvoices).where(eq(dInvoices.id, parseInt(id)))];
                    case 2:
                        // Delete D-invoice
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.generateDInvoiceNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var year, nextNumber, dInvoiceNumber, exists, existingDInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        year = new Date().getFullYear();
                        nextNumber = 1;
                        exists = true;
                        _a.label = 1;
                    case 1:
                        if (!exists) return [3 /*break*/, 3];
                        dInvoiceNumber = "DINV-".concat(year, "-").concat(nextNumber.toString().padStart(4, '0'));
                        return [4 /*yield*/, db
                                .select({ id: dInvoices.id })
                                .from(dInvoices)
                                .where(eq(dInvoices.invoiceNumber, dInvoiceNumber))];
                    case 2:
                        existingDInvoice = (_a.sent())[0];
                        if (!existingDInvoice) {
                            exists = false;
                        }
                        else {
                            nextNumber++;
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, dInvoiceNumber];
                }
            });
        });
    };
    // Quotations implementation
    DatabaseStorage.prototype.getQuotations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var quotationsWithDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            quotation: quotations,
                            parts: sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["COALESCE(json_agg(", ") FILTER (WHERE ", " IS NOT NULL), '[]'::json)"], ["COALESCE(json_agg(", ") FILTER (WHERE ", " IS NOT NULL), '[]'::json)"])), quotationParts, quotationParts.id).as('parts')
                        })
                            .from(quotations)
                            .leftJoin(quotationParts, eq(quotations.id, quotationParts.quotationId))
                            .groupBy(quotations.id)
                            .orderBy(desc(quotations.createdAt))];
                    case 1:
                        quotationsWithDetails = _a.sent();
                        return [2 /*return*/, quotationsWithDetails.map(function (row) { return (__assign(__assign({}, row.quotation), { parts: Array.isArray(row.parts) ? row.parts : JSON.parse(row.parts) })); })];
                }
            });
        });
    };
    DatabaseStorage.prototype.createQuotation = function (quotation_1) {
        return __awaiter(this, arguments, void 0, function (quotation, parts) {
            var quotationNumber, quotationData, newQuotation;
            var _a;
            if (parts === void 0) { parts = []; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.generateQuotationNumber()];
                    case 1:
                        quotationNumber = _b.sent();
                        quotationData = __assign(__assign({}, quotation), { quotationNumber: quotationNumber, serviceCharge: ((_a = quotation.serviceCharge) === null || _a === void 0 ? void 0 : _a.toString()) || "0", totalAmount: quotation.totalAmount.toString() });
                        return [4 /*yield*/, db
                                .insert(quotations)
                                .values(quotationData)
                                .returning()];
                    case 2:
                        newQuotation = (_b.sent())[0];
                        if (!(parts && parts.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .insert(quotationParts)
                                .values(parts.map(function (part) { return ({
                                quotationId: newQuotation.id,
                                name: part.name,
                                quantity: part.quantity,
                                unitPrice: part.unitPrice.toString(),
                                amount: part.amount.toString()
                            }); }))];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, newQuotation];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateQuotation = function (id, quotation) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updatedQuotation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = __assign(__assign({}, quotation), { updatedAt: new Date() });
                        // Only convert numeric fields if they are provided
                        if (quotation.serviceCharge !== undefined) {
                            updateData.serviceCharge = quotation.serviceCharge.toString();
                        }
                        if (quotation.totalAmount !== undefined) {
                            updateData.totalAmount = quotation.totalAmount.toString();
                        }
                        return [4 /*yield*/, db
                                .update(quotations)
                                .set(updateData)
                                .where(eq(quotations.id, parseInt(id)))
                                .returning()];
                    case 1:
                        updatedQuotation = (_a.sent())[0];
                        return [2 /*return*/, updatedQuotation];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteQuotation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var numericId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        numericId = parseInt(id);
                        return [4 /*yield*/, db.delete(quotationParts).where(eq(quotationParts.quotationId, numericId))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db.delete(quotations).where(eq(quotations.id, numericId))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getQuotationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var numericId, quotation, parts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        numericId = parseInt(id);
                        return [4 /*yield*/, db
                                .select()
                                .from(quotations)
                                .where(eq(quotations.id, numericId))
                                .limit(1)];
                    case 1:
                        quotation = (_a.sent())[0];
                        if (!quotation)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(quotationParts)
                                .where(eq(quotationParts.quotationId, numericId))];
                    case 2:
                        parts = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, quotation), { parts: parts || [] })];
                }
            });
        });
    };
    DatabaseStorage.prototype.generateQuotationNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var year, nextNumber, quotationNumber, exists, existingQuotation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        year = new Date().getFullYear();
                        nextNumber = 1;
                        exists = true;
                        _a.label = 1;
                    case 1:
                        if (!exists) return [3 /*break*/, 3];
                        quotationNumber = "QUO-".concat(year, "-").concat(nextNumber.toString().padStart(4, '0'));
                        return [4 /*yield*/, db
                                .select({ id: quotations.id })
                                .from(quotations)
                                .where(eq(quotations.quotationNumber, quotationNumber))];
                    case 2:
                        existingQuotation = (_a.sent())[0];
                        if (!existingQuotation) {
                            exists = false;
                        }
                        else {
                            nextNumber++;
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, quotationNumber];
                }
            });
        });
    };
    return DatabaseStorage;
}());
export { DatabaseStorage };
export var storage = new DatabaseStorage();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
